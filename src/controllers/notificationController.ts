import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { StoreAccessError } from '../utils/storeAccess';
import { NOTIFICATION_SETTING_KEYS, NotificationSettingKey } from '../constants/notificationSettings';
import { ensureOwnerSettings } from '../services/notificationService';

const SETTINGS_TABLE = 'STORE_NOTIFICATION_SETTINGS';

export const getNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'store_owner') {
      res.status(403).json({ error: 'Store owner access required' });
      return;
    }

    const settings = await ensureOwnerSettings(req.user.id);

    res.status(200).json({
      owner_id: req.user.id,
      settings,
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Server error fetching notification settings' });
  }
};

export const updateNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'store_owner') {
      res.status(403).json({ error: 'Only store owners can update settings' });
      return;
    }

    const updates: Partial<Record<NotificationSettingKey, boolean>> = {};
    for (const key of NOTIFICATION_SETTING_KEYS) {
      if (key in req.body) {
        const value = req.body[key];
        if (typeof value !== 'boolean') {
          res.status(400).json({ error: `Field ${key} must be a boolean` });
          return;
        }
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid notification settings provided' });
      return;
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates).map((value) => (value ? 1 : 0));

    await pool.query(
      `UPDATE ${SETTINGS_TABLE}
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE owner_id = ?`,
      [...values, req.user.id]
    );

    const updatedSettings = await ensureOwnerSettings(req.user.id);

    res.status(200).json({
      owner_id: req.user.id,
      settings: updatedSettings,
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Server error updating notification settings' });
  }
};
