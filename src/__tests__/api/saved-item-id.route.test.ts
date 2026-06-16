jest.mock('axios');

import axios from 'axios';
import { DELETE } from '@/app/api/saved_item/[id]/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosDelete = axios.delete as jest.Mock;

describe('DELETE /api/saved_item/[id]', () => {
  beforeEach(() => setupApiTest());

  it('deletes saved item', async () => {
    mockAxiosDelete.mockResolvedValue({});
    const req = createMockNextRequest('https://localhost:3000/api/saved_item/42', { headers: { authorization: 'Token test' } });
    await DELETE(req, { params: Promise.resolve({ id: '42' }) });
    expect(mockAxiosDelete).toHaveBeenCalledWith(
      'https://test-api.com/saved_item/42/',
      expect.any(Object)
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });

  it('returns 401 without auth', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/saved_item/42', {});
    await DELETE(req, { params: Promise.resolve({ id: '42' }) });
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });
});
