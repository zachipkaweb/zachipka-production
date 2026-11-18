'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-10">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10">
        <div className="mb-8">
          <h3 className="text-purple uppercase mb-2 font-bold text-xs tracking-wider">
            Скеледром «Зачіпка»
          </h3>
          <h1 className="text-gray uppercase font-bold text-2xl sm:text-3xl leading-none mb-2">
            Вхід в адмінку
          </h1>
          <p className="text-gray/70 text-sm">
            Введіть пароль для доступу до керування
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase font-bold text-gray tracking-wider mb-2"
            >
              Пароль доступу
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              disabled={isPending}
              placeholder="Введіть пароль"
              className="w-full bg-white border border-gray/30 p-3.5 text-gray placeholder-gray/40 focus:border-gray focus:outline-none focus:ring-1 focus:ring-gray disabled:opacity-50 transition text-base"
            />
          </div>

          {state?.error && (
            <div className="bg-red/10 border border-red/30 p-3.5 text-red text-sm font-medium">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-yellow hover:bg-red text-gray hover:text-white uppercase font-bold text-sm tracking-wider p-4 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
          >
            {isPending ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray border-t-transparent" />
            ) : (
              'Увійти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}