import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { CreateStoreRequest } from '../models/types';

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [result] = await pool.query(
      `SELECT
        s.*,
        COUNT(DISTINCT sli.id) as lottery_count,
        COALESCE(SUM(sli.current_count), 0) as total_active_tickets
      FROM stores s
      LEFT JOIN store_lottery_inventory sli ON s.id = sli.store_id
      WHERE s.owner_id = ? AND s.active = true
      GROUP BY s.id
      ORDER BY s.created_at DESC`,
      [userId]
    );

    res.status(200).json({ stores: result });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStoreById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const storeId = parseInt(req.params.id);

    const [result] = await pool.query(
      'SELECT * FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );

    if ((result as any[]).length === 0) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.status(200).json({ store: (result as any[])[0] });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, address, phone }: CreateStoreRequest = req.body;

    if (!name || !address) {
      res.status(400).json({ error: 'Name and address are required' });
      return;
    }

    // Insert store
    const [storeResult] = await pool.query(
      'INSERT INTO stores (owner_id, name, address, phone) VALUES (?, ?, ?, ?)',
      [userId, name, address, phone || null]
    );

    const storeId = (storeResult as any).insertId;

    // Get the newly created store
    const [stores] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    const store = (stores as any[])[0];

    // Automatically create inventory for all lottery types
    const [lotteryTypesResult] = await pool.query(
      'SELECT id FROM lottery_types WHERE active = true'
    );

    const inventoryPromises = (lotteryTypesResult as any[]).map((lt) =>
      pool.query(
        'INSERT INTO store_lottery_inventory (store_id, lottery_type_id, total_count, current_count) VALUES (?, ?, ?, ?)',
        [store.id, lt.id, 100, 100]
      )
    );

    await Promise.all(inventoryPromises);

    res.status(201).json({
      store,
      message: 'Store created successfully with full lottery inventory',
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const storeId = parseInt(req.params.id);
    const { name, address, phone, active } = req.body;

    // Verify ownership
    const [checkResult] = await pool.query(
      'SELECT * FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );

    if ((checkResult as any[]).length === 0) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    await pool.query(
      `UPDATE stores
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          active = COALESCE(?, active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND owner_id = ?`,
      [name, address, phone, active, storeId, userId]
    );

    // Get updated store
    const [result] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId]);

    res.status(200).json({
      store: (result as any[])[0],
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const storeId = parseInt(req.params.id);

    const [result] = await pool.query(
      'DELETE FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
