import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { UserAccount } from '@/shared/types';
import { apiPost } from '@/shared/lib/api';
import { writeLocal, writeLocalString } from '@/shared/lib/storage';
import { AUTH_TOKEN_KEY, USER_KEY } from '@/shared/lib/storageKeys';

type AuthMode = 'login' | 'register';

type AuthProps = {
  onSuccess: (user: UserAccount, token: string) => void;
  onCancel?: () => void;
};

export const AuthModal: React.FC<AuthProps> = ({ onSuccess, onCancel }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, username };

      const data = await apiPost<{ token: string; user: UserAccount }>(endpoint, body);

      // 保存token到localStorage
      writeLocalString(AUTH_TOKEN_KEY, data.token);
      writeLocal(USER_KEY, data.user);

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-sm shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-paper p-6">
          <h2 className="text-2xl font-serif font-bold mb-1">
            {mode === 'login' ? '登录账户' : '注册账户'}
          </h2>
          <p className="text-sm text-stone-300">
            {mode === 'login' ? '欢迎回来，继续你的旅程' : '开始你的文化探索之旅'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-serif font-bold text-ink mb-2">
                <User size={14} className="inline mr-1" />
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-sm focus:outline-none focus:border-stamp transition-colors"
                placeholder="选择一个用户名"
                required
                minLength={3}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-serif font-bold text-ink mb-2">
              <Mail size={14} className="inline mr-1" />
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-sm focus:outline-none focus:border-stamp transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-serif font-bold text-ink mb-2">
              <Lock size={14} className="inline mr-1" />
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-sm focus:outline-none focus:border-stamp transition-colors"
              placeholder="至少6个字符"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 rounded-sm font-serif font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              '处理中...'
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} />
                登录
              </>
            ) : (
              <>
                <UserPlus size={18} />
                注册
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-sm text-stamp hover:text-ink transition-colors"
            >
              {mode === 'login' ? '还没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-sm text-stone-500 hover:text-ink transition-colors"
            >
              稍后再说
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
