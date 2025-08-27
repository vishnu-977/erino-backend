const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');

function parseNumberFilter(prefix, q) {
  const value = q[prefix];
  if (value === undefined) return null;
  if (value.includes(',')) {
    const parts = value.split(',').map(Number);
    if (parts.length === 2) return { $gte: parts[0], $lte: parts[1] };
  }
  if (value.startsWith('gt:')) return { $gt: Number(value.slice(3)) };
  if (value.startsWith('lt:')) return { $lt: Number(value.slice(3)) };
  return Number(value);
}

function parseDateFilter(prefix, q) {
  const value = q[prefix];
  if (!value) return null;
  if (value.includes(',')) {
    const parts = value.split(',');
    const d1 = new Date(parts[0]);
    const d2 = new Date(parts[1]);
    return { $gte: d1, $lte: d2 };
  }
  if (value.startsWith('before:')) return { $lt: new Date(value.slice(7)) };
  if (value.startsWith('after:')) return { $gt: new Date(value.slice(6)) };
  return new Date(value);
}

router.post('/', auth, async (req, res) => {
  try {
    const body = req.body;
    const lead = await Lead.create(body);
    res.status(201).json(lead);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate email' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const q = req.query;
    const page = Math.max(1, parseInt(q.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(q.limit || '20')));
    const skip = (page - 1) * limit;
    const filter = {};
    if (q.email_eq) filter.email = q.email_eq;
    if (q.email_contains) filter.email = { $regex: q.email_contains, $options: 'i' };
    if (q.company_eq) filter.company = q.company_eq;
    if (q.company_contains) filter.company = { $regex: q.company_contains, $options: 'i' };
    if (q.city_eq) filter.city = q.city_eq;
    if (q.city_contains) filter.city = { $regex: q.city_contains, $options: 'i' };
    if (q.status) {
      const vals = q.status.split(',');
      filter.status = vals.length > 1 ? { $in: vals } : vals[0];
    }
    if (q.source) {
      const vals = q.source.split(',');
      filter.source = vals.length > 1 ? { $in: vals } : vals[0];
    }
    const scoreFilter = parseNumberFilter('score', q);
    if (scoreFilter !== null) filter.score = scoreFilter;
    const valueFilter = parseNumberFilter('lead_value', q);
    if (valueFilter !== null) filter.lead_value = valueFilter;
    const createdAtFilter = parseDateFilter('created_at', q);
    if (createdAtFilter !== null) filter.created_at = createdAtFilter;
    const lastActivityFilter = parseDateFilter('last_activity_at', q);
    if (lastActivityFilter !== null) filter.last_activity_at = lastActivityFilter;
    if (q.is_qualified !== undefined) {
      const val = q.is_qualified === 'true';
      filter.is_qualified = val;
    }
    const total = await Lead.countDocuments(filter);
    const data = await Lead.find(filter).skip(skip).limit(limit).sort({ created_at: -1 });
    res.status(200).json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const update = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(lead);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate email' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
