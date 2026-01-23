import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { getPool } from '../db.js';
import { ok, fail } from '../utils/response.js';
import { requireAuthUser } from '../utils/auth.js';
import { generateItinerary, type ItineraryForm, type ItineraryActivity, type ItineraryDay } from '../services/itineraryGenerator.js';

type ItineraryRecord = {
  id: string;
  form: ItineraryForm;
  days: ItineraryDay[];
  summary: string;
  createdAt: string;
  totalSpots: number;
  totalBudget: number;
};

type ValidationErrors = Record<string, string>;

/**
 * Validate itinerary form data
 */
const validateItineraryForm = (form: any): { valid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  // Validate city
  if (!form.city || typeof form.city !== 'string' || form.city.trim() === '') {
    errors.city = '目的地不能为空';
  }

  // Validate startDate
  if (!form.startDate || typeof form.startDate !== 'string') {
    errors.startDate = '出发日期不能为空';
  } else {
    const date = new Date(form.startDate);
    if (isNaN(date.getTime())) {
      errors.startDate = '出发日期格式无效';
    }
  }

  // Validate endDate
  if (!form.endDate || typeof form.endDate !== 'string') {
    errors.endDate = '结束日期不能为空';
  } else {
    const date = new Date(form.endDate);
    if (isNaN(date.getTime())) {
      errors.endDate = '结束日期格式无效';
    }
  }

  // Validate days
  if (typeof form.days !== 'number' || form.days < 1 || form.days > 30) {
    errors.days = '旅行天数必须在 1-30 之间';
  }

  // Validate travelers
  if (!form.travelers || typeof form.travelers !== 'object') {
    errors.travelers = '同行人信息不能为空';
  } else {
    if (typeof form.travelers.count !== 'number' || form.travelers.count < 1) {
      errors['travelers.count'] = '同行人数必须至少为 1';
    }
    const validTypes = ['solo', 'couple', 'family', 'friends'];
    if (!validTypes.includes(form.travelers.type)) {
      errors['travelers.type'] = '同行人类型无效';
    }
  }

  // Validate interests
  if (!Array.isArray(form.interests) || form.interests.length < 3) {
    errors.interests = '至少选择 3 个兴趣标签';
  }

  // Validate intensity
  const validIntensities = ['relaxed', 'moderate', 'packed'];
  if (!validIntensities.includes(form.intensity)) {
    errors.intensity = '旅行强度无效';
  }

  // Validate budget
  const validBudgets = ['economy', 'comfortable', 'luxury'];
  if (!validBudgets.includes(form.budget)) {
    errors.budget = '预算范围无效';
  }

  // Validate transport
  const validTransports = ['walking', 'public', 'taxi', 'driving'];
  if (!validTransports.includes(form.transport)) {
    errors.transport = '交通方式无效';
  }

  // Validate requirements (optional but must be array if present)
  if (form.requirements !== undefined && !Array.isArray(form.requirements)) {
    errors.requirements = '特殊要求必须是数组';
  }

  // Validate mustVisit (optional but must be array if present)
  if (form.mustVisit !== undefined && !Array.isArray(form.mustVisit)) {
    errors.mustVisit = '必游景点必须是数组';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Map database row to ItineraryRecord
 */
const mapRow = (row: {
  id: string;
  user_id: string;
  form_data: any;
  days_data: any;
  summary: string;
  total_spots: number;
  total_budget: number;
  created_at: Date;
  updated_at: Date;
}): ItineraryRecord => ({
  id: row.id,
  form: row.form_data,
  days: row.days_data,
  summary: row.summary,
  createdAt: row.created_at.toISOString(),
  totalSpots: row.total_spots,
  totalBudget: row.total_budget,
});

export const registerItineraryRoutes = async (app: FastifyInstance) => {
  /**
   * POST /itineraries
   * Create a new itinerary
   */
  app.post('/itineraries', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;

    const form = request.body as ItineraryForm;

    // Validate form data
    const validation = validateItineraryForm(form);
    if (!validation.valid) {
      reply.status(400);
      return {
        ok: false,
        error: '表单数据无效',
        details: validation.errors,
      };
    }

    try {
      // Generate itinerary using AI service
      const generated = await generateItinerary(form);

      // Store to database
      const db = getPool();
      const id = randomUUID();
      const result = await db.query(
        `INSERT INTO itineraries (id, user_id, form_data, days_data, summary, total_spots, total_budget)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, form_data, days_data, summary, total_spots, total_budget, created_at, updated_at`,
        [id, user.id, JSON.stringify(form), JSON.stringify(generated.days), generated.summary, generated.totalSpots, generated.totalBudget],
      );

      return ok(mapRow(result.rows[0]));
    } catch (error: any) {
      console.error('Error creating itinerary:', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
      });
      reply.status(500);
      return fail('服务器内部错误，请稍后重试');
    }
  });

  /**
   * GET /itineraries
   * Get user's itinerary list
   */
  app.get('/itineraries', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;

    try {
      const db = getPool();
      const result = await db.query(
        `SELECT id, user_id, form_data, days_data, summary, total_spots, total_budget, created_at, updated_at
         FROM itineraries
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [user.id],
      );

      return ok({ itineraries: result.rows.map(mapRow) });
    } catch (error: any) {
      console.error('Error fetching itineraries:', {
        userId: user.id,
        error: error.message,
        stack: error.stack,
      });
      reply.status(500);
      return fail('服务器内部错误，请稍后重试');
    }
  });

  /**
   * GET /itineraries/:id
   * Get specific itinerary
   */
  app.get('/itineraries/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };

    try {
      const db = getPool();
      const result = await db.query(
        `SELECT id, user_id, form_data, days_data, summary, total_spots, total_budget, created_at, updated_at
         FROM itineraries
         WHERE id = $1`,
        [id],
      );

      if (result.rowCount === 0) {
        reply.status(404);
        return fail('行程不存在');
      }

      const itinerary = result.rows[0];

      // Verify ownership
      if (itinerary.user_id !== user.id) {
        reply.status(403);
        return fail('无权访问此资源');
      }

      return ok(mapRow(itinerary));
    } catch (error: any) {
      console.error('Error fetching itinerary:', {
        userId: user.id,
        itineraryId: id,
        error: error.message,
        stack: error.stack,
      });
      reply.status(500);
      return fail('服务器内部错误，请稍后重试');
    }
  });

  /**
   * DELETE /itineraries/:id
   * Delete an itinerary
   */
  app.delete('/itineraries/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };

    try {
      const db = getPool();

      // Check if itinerary exists and belongs to user
      const checkResult = await db.query(
        `SELECT user_id FROM itineraries WHERE id = $1`,
        [id],
      );

      if (checkResult.rowCount === 0) {
        reply.status(404);
        return fail('行程不存在');
      }

      if (checkResult.rows[0].user_id !== user.id) {
        reply.status(403);
        return fail('无权访问此资源');
      }

      // Delete the itinerary
      await db.query(`DELETE FROM itineraries WHERE id = $1`, [id]);

      return ok({ success: true, id });
    } catch (error: any) {
      console.error('Error deleting itinerary:', {
        userId: user.id,
        itineraryId: id,
        error: error.message,
        stack: error.stack,
      });
      reply.status(500);
      return fail('服务器内部错误，请稍后重试');
    }
  });
};
