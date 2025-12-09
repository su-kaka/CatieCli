from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta

from app.database import get_db
from app.models.user import User, APIKey, UsageLog, Credential
from app.services.auth import get_current_admin, get_password_hash
from app.services.credential_pool import CredentialPool
from app.services.websocket import notify_user_update, notify_credential_update

router = APIRouter(prefix="/api/admin", tags=["管理后台"])


# ===== 用户管理 =====
class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    daily_quota: Optional[int] = None
    flash_quota: Optional[int] = None
    pro25_quota: Optional[int] = None
    pro30_quota: Optional[int] = None


@router.get("/users")
async def list_users(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """获取所有用户"""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    user_list = []
    for u in users:
        # 获取今日使用量
        today = date.today()
        usage_result = await db.execute(
            select(func.count(UsageLog.id))
            .where(UsageLog.user_id == u.id)
            .where(func.date(UsageLog.created_at) == today)
        )
        today_usage = usage_result.scalar() or 0
        
        # 获取用户活跃凭证数量
        cred_result = await db.execute(
            select(func.count(Credential.id))
            .where(Credential.user_id == u.id)
            .where(Credential.is_active == True)
        )
        credential_count = cred_result.scalar() or 0
        
        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "daily_quota": u.daily_quota,
            "today_usage": today_usage,
            "credential_count": credential_count,
            "discord_id": u.discord_id,
            "discord_name": u.discord_name,
            "created_at": u.created_at
        })
    
    return {"users": user_list, "total": len(user_list)}


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    data: UserUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """更新用户"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_admin is not None:
        user.is_admin = data.is_admin
    if data.daily_quota is not None:
        user.daily_quota = data.daily_quota
    if data.flash_quota is not None:
        user.flash_quota = data.flash_quota
    if data.pro25_quota is not None:
        user.pro25_quota = data.pro25_quota
    if data.pro30_quota is not None:
        user.pro30_quota = data.pro30_quota
    
    await db.commit()
    await notify_user_update()
    return {"message": "更新成功"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """删除用户"""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 删除用户的凭证（设置 user_id 为 NULL 或直接删除）
    await db.execute(
        update(Credential).where(Credential.user_id == user_id).values(user_id=None)
    )
    
    await db.delete(user)
    await db.commit()
    await notify_user_update()
    await notify_credential_update()
    return {"message": "删除成功"}


# ===== 凭证管理 =====
class CredentialCreate(BaseModel):
    name: str
    api_key: str


class CredentialUpdate(BaseModel):
    name: Optional[str] = None
    api_key: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/credentials")
async def list_credentials(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """获取所有凭证"""
    from sqlalchemy.orm import selectinload
    
    # 获取凭证及其所有者信息
    result = await db.execute(
        select(Credential).options(selectinload(Credential.owner)).order_by(Credential.created_at.desc())
    )
    credentials = result.scalars().all()
    
    return {
        "credentials": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "api_key": c.api_key[:20] + "..." if c.api_key and len(c.api_key) > 20 else (c.api_key or ""),
                "is_active": c.is_active,
                "is_public": c.is_public,
                "user_id": c.user_id,
                "owner_name": c.owner.username if c.owner else None,
                "total_requests": c.total_requests,
                "failed_requests": c.failed_requests,
                "last_used_at": c.last_used_at,
                "last_error": c.last_error,
                "created_at": c.created_at
            }
            for c in credentials
        ],
        "total": len(credentials)
    }


@router.post("/credentials")
async def add_credential(
    data: CredentialCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """添加凭证"""
    credential = await CredentialPool.add_credential(db, data.name, data.api_key)
    await notify_credential_update()
    return {"message": "添加成功", "id": credential.id}


@router.put("/credentials/{credential_id}")
async def update_credential(
    credential_id: int,
    data: CredentialUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """更新凭证"""
    result = await db.execute(select(Credential).where(Credential.id == credential_id))
    credential = result.scalar_one_or_none()
    if not credential:
        raise HTTPException(status_code=404, detail="凭证不存在")
    
    if data.name is not None:
        credential.name = data.name
    if data.api_key is not None:
        credential.api_key = data.api_key
    if data.is_active is not None:
        credential.is_active = data.is_active
    
    await db.commit()
    await notify_credential_update()
    return {"message": "更新成功"}


@router.delete("/credentials/{credential_id}")
async def delete_credential(
    credential_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """删除凭证"""
    from app.config import settings
    
    result = await db.execute(select(Credential).where(Credential.id == credential_id))
    credential = result.scalar_one_or_none()
    if not credential:
        raise HTTPException(status_code=404, detail="凭证不存在")
    
    # 如果是公开凭证，扣除用户配额
    if credential.is_public and credential.user_id:
        owner_result = await db.execute(select(User).where(User.id == credential.user_id))
        owner = owner_result.scalar_one_or_none()
        if owner:
            owner.daily_quota = max(settings.default_daily_quota, owner.daily_quota - settings.credential_reward_quota)
            print(f"[管理员删除凭证] 用户 {owner.username} 扣除 {settings.credential_reward_quota} 额度", flush=True)
    
    await db.delete(credential)
    await db.commit()
    await notify_credential_update()
    return {"message": "删除成功"}


# ===== 统计 =====
@router.get("/stats")
async def get_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """获取系统统计"""
    # 用户数
    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    
    # 凭证数
    credential_count = (await db.execute(select(func.count(Credential.id)))).scalar() or 0
    active_credential_count = (await db.execute(
        select(func.count(Credential.id)).where(Credential.is_active == True)
    )).scalar() or 0
    
    # 今日请求数
    today = date.today()
    today_requests = (await db.execute(
        select(func.count(UsageLog.id)).where(func.date(UsageLog.created_at) == today)
    )).scalar() or 0
    
    # 总请求数
    total_requests = (await db.execute(select(func.count(UsageLog.id)))).scalar() or 0
    
    # 最近7天请求趋势
    daily_stats = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = (await db.execute(
            select(func.count(UsageLog.id)).where(func.date(UsageLog.created_at) == day)
        )).scalar() or 0
        daily_stats.append({"date": day.isoformat(), "count": count})
    
    return {
        "user_count": user_count,
        "credential_count": credential_count,
        "active_credential_count": active_credential_count,
        "today_requests": today_requests,
        "total_requests": total_requests,
        "daily_stats": daily_stats
    }


@router.get("/logs")
async def get_logs(
    limit: int = 100,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """获取使用日志"""
    result = await db.execute(
        select(UsageLog, User.username)
        .join(User, UsageLog.user_id == User.id)
        .order_by(UsageLog.created_at.desc())
        .limit(limit)
    )
    logs = result.all()
    
    return {
        "logs": [
            {
                "id": log.UsageLog.id,
                "username": log.username,
                "model": log.UsageLog.model,
                "endpoint": log.UsageLog.endpoint,
                "status_code": log.UsageLog.status_code,
                "latency_ms": log.UsageLog.latency_ms,
                "created_at": log.UsageLog.created_at
            }
            for log in logs
        ]
    }


# ===== 配额设置 =====
class QuotaUpdate(BaseModel):
    quota: int


@router.post("/settings/default-quota")
async def set_default_quota(
    data: QuotaUpdate,
    admin: User = Depends(get_current_admin)
):
    """设置新用户默认配额"""
    from app.config import settings, save_config_to_db
    settings.default_daily_quota = data.quota
    # 持久化保存到数据库
    await save_config_to_db("default_daily_quota", data.quota)
    return {"message": "默认配额已更新", "quota": data.quota}


@router.post("/settings/batch-quota")
async def batch_update_quota(
    data: QuotaUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """批量更新所有用户配额"""
    await db.execute(
        update(User).values(daily_quota=data.quota)
    )
    await db.commit()
    await notify_user_update()
    return {"message": f"已将所有用户配额设为 {data.quota}"}
