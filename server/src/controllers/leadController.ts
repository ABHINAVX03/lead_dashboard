import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ILead, Lead } from '../models/Lead';
import { body, validationResult } from 'express-validator';
import { Parser } from 'json2csv';

// Validation rules
export const createLeadValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('source').isIn(['Website', 'Instagram', 'Referral']).withMessage('Invalid source'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
];

export const updateLeadValidation = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('source').optional().isIn(['Website', 'Instagram', 'Referral']),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
];

// Get all leads with filtering, sorting, pagination
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = '1',
      limit = '10',
    } = req.query;

    const queryObj: FilterQuery<ILead> = {};

    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      queryObj.createdBy = currentUser?._id;
    }

    // Status filter
    if (status && typeof status === 'string') {
      queryObj.status = status;
    }

    // Source filter
    if (source && typeof source === 'string') {
      queryObj.source = source;
    }

    // Search by name or email
    if (search && typeof search === 'string') {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    const sortOrder = sort === 'oldest' ? 'createdAt' : '-createdAt';

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(queryObj)
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Lead.countDocuments(queryObj),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create lead
export const createLead = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const currentUser = req.user;
    const lead = await Lead.create({
      ...req.body,
      createdBy: currentUser?._id,
    });

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update lead
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const currentUser = req.user;
    if (currentUser?.role !== 'admin' && lead.createdBy.toString() !== currentUser?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete lead
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const currentUser = req.user;
    if (currentUser?.role !== 'admin' && lead.createdBy.toString() !== currentUser?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export leads as CSV
export const exportLeadsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, search } = req.query;
    const queryObj: FilterQuery<ILead> = {};

    const currentUser = req.user;
    if (currentUser?.role !== 'admin') {
      queryObj.createdBy = currentUser?._id;
    }

    if (status && typeof status === 'string') queryObj.status = status;
    if (source && typeof source === 'string') queryObj.source = source;
    if (search && typeof search === 'string') {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(queryObj)
      .sort('-createdAt')
      .populate('createdBy', 'name email');

    const fields = ['name', 'email', 'status', 'source', 'createdAt', 'updatedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.header('Content-Type', 'text/csv');
    res.attachment(`leads_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error generating CSV' });
  }
};
