'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateTrainingPricesAction,
  addTrainingPriceAction,
  deleteTrainingPriceAction,
} from './actions';
import ImageDropzone from '../events/ImageDropzone';
import AdminAlert from '@/components/admin/AdminAlert';

// Color palette configurations for popular packages (cycled by display index)
const PACKAGE_PALETTES = [
  { name: 'Жовтий', bg: 'bg-yellow', border: 'border-yellow', text: 'text-gray' },
  { name: 'Червоний', bg: 'bg-red', border: 'border-red', text: 'text-white' },
  { name: 'Сірий', bg: 'bg-gray', border: 'border-gray', text: 'text-yellow' },
  { name: 'Фіолетовий', bg: 'bg-purple', border: 'border-purple', text: 'text-white' },
  { name: 'Помаранчевий', bg: 'bg-orange', border: 'border-orange', text: 'text-white' },
  { name: 'Блакитний', bg: 'bg-blue', border: 'border-blue', text: 'text-white' },
];

// Preset hex colors available for climbing sections
const SECTION_COLOR_PRESETS = [
  { name: 'Помаранчевий', hex: '#ff991b' },
  { name: 'Фіолетовий', hex: '#9e5aa5' },
  { name: 'Червоний', hex: '#e0564a' },
  { name: 'Блакитний', hex: '#3eb7df' },
  { name: 'Жовтий', hex: '#e0ec59' },
  { name: 'Сірий', hex: '#3f3d3d' },
];

/** Checkbox component to toggle public visibility (isActive flag) */
function ActiveToggle({ id, defaultActive = false }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-gray">
      <input
        type="checkbox"
        name={`isActive_${id}`}
        defaultChecked={defaultActive}
        className="w-4 h-4 accent-gray cursor-pointer"
      />
      Активна (показувати)
    </label>
  );
}

function SectionColorSelector({ id, defaultColor }) {
  const [color, setColor] = useState(defaultColor || '#ff991b');

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`color_${id}`}
        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40"
      >
        Колір секції
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        {SECTION_COLOR_PRESETS.map((p) => (
          <button
            key={p.hex}
            type="button"
            onClick={() => setColor(p.hex)}
            className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
              color?.toLowerCase() === p.hex.toLowerCase()
                ? 'scale-115 border-gray ring-2 ring-yellow'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: p.hex }}
            title={p.name}
          />
        ))}

        <div className="flex items-center gap-1.5 ml-1">
          <input
            type="color"
            value={color && color.startsWith('#') && color.length === 7 ? color : '#ff991b'}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 cursor-pointer rounded border border-gray/20 p-0 bg-transparent"
            title="Обрати довільний колір"
          />
          <input
            type="text"
            id={`color_${id}`}
            name={`color_${id}`}
            value={color || ''}
            onChange={(e) => setColor(e.target.value)}
            className="w-24 text-xs font-bold uppercase px-2 py-1 border border-gray/20 focus:border-gray focus:outline-none bg-white"
            placeholder="#ff991b"
          />
        </div>
      </div>
    </div>
  );
}

export default function PricesForm({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const [packages, setPackages] = useState(initialData?.packages || []);
  const [sections, setSections] = useState(initialData?.sections || []);
  const [subscriptions, setSubscriptions] = useState(initialData?.subscriptions || []);
  const [prevData, setPrevData] = useState(initialData);

  if (initialData !== prevData) {
    setPrevData(initialData);
    setPackages(initialData?.packages || []);
    setSections(initialData?.sections || []);
    setSubscriptions(initialData?.subscriptions || []);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateTrainingPricesAction(formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Ціни успішно збережено в базі даних!' });
        router.refresh();
      }
    });
  };

  const handleAdd = (category) => {
    if (category === 'package' && packages.length >= 6) {
      setMessage({ type: 'error', text: 'Максимальна кількість популярних пакетів — 6.' });
      return;
    }

    const titles = {
      package: 'новий популярний пакет',
      section: 'нову секцію',
      subscription: 'новий абонемент',
    };

    if (!window.confirm(`Додати ${titles[category] || 'новий запис'}?`)) return;
    setMessage(null);

    startTransition(async () => {
      const res = await addTrainingPriceAction(category);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({
          type: 'success',
          text: 'Новий запис успішно додано (за замовчуванням прихований)!',
        });
        if (res.item) {
          if (category === 'package') setPackages((prev) => [...prev, res.item]);
          else if (category === 'section') setSections((prev) => [...prev, res.item]);
          else if (category === 'subscription') setSubscriptions((prev) => [...prev, res.item]);
        }
        router.refresh();
      }
    });
  };

  const handleDelete = (id, title, category) => {
    if (category === 'package' && packages.length <= 1) {
      setMessage({ type: 'error', text: 'Повинен залишатися щонайменше 1 популярний пакет.' });
      return;
    }

    if (!window.confirm(`Видалити «${title}»?`)) return;
    setMessage(null);

    // Optimistically remove from state immediately
    if (category === 'package') {
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } else if (category === 'section') {
      setSections((prev) => prev.filter((s) => s.id !== id));
    } else if (category === 'subscription') {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }

    startTransition(async () => {
      const res = await deleteTrainingPriceAction(id);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
        router.refresh();
      } else {
        setMessage({ type: 'success', text: 'Запис успішно видалено!' });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <AdminAlert message={message} onClose={() => setMessage(null)} />

      {/* SECTION 1: POPULAR PACKAGES */}
      <div className="p-6 bg-white flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center pb-2 border-b border-gray/10 gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray">
              1. Популярні пакети ({packages.length}/6)
            </h3>
          </div>

          {packages.length < 6 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAdd('package')}
              className="text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
            >
              + Додати пакет
            </button>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-gray/40">
              Досягнуто ліміт (6 пакетів)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((item, index) => {
            const palette = PACKAGE_PALETTES[index % PACKAGE_PALETTES.length];
            return (
              <div
                key={item.id}
                className="border border-gray/20 bg-white p-4 sm:p-5 flex flex-col justify-between min-h-70 relative"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-3.5 h-3.5 rounded-full ${palette.bg} border border-gray/30`}
                        title={`Колір на сайті: ${palette.name}`}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray/50">
                        Пакет #{index + 1} ({palette.name})
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isPending || packages.length <= 1}
                      onClick={() => handleDelete(item.id, item.title, 'package')}
                      className="text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-30 disabled:hover:no-underline"
                      title={
                        packages.length <= 1
                          ? 'Мінімум 1 пакет'
                          : 'Видалити пакет'
                      }
                    >
                      Видалити
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label
                        htmlFor={`title_${item.id}`}
                        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                      >
                        Назва пакета
                      </label>
                      <textarea
                        id={`title_${item.id}`}
                        name={`title_${item.id}`}
                        defaultValue={item.title}
                        required
                        rows={2}
                        placeholder="ВВЕДІТЬ НАЗВУ"
                        className="w-full text-xl sm:text-2xl font-bold uppercase leading-tight text-gray bg-transparent border-b border-gray/10 focus:border-gray focus:outline-none focus:bg-yellow/10 transition-colors pb-1 resize-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`desc_${item.id}`}
                        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                      >
                        Опис пакета
                      </label>
                      <textarea
                        id={`desc_${item.id}`}
                        name={`desc_${item.id}`}
                        defaultValue={item.description || ''}
                        rows={3}
                        placeholder="Опис пакета..."
                        className="w-full text-sm text-gray/80 bg-transparent border border-dashed border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2.5 resize-none transition-colors leading-relaxed"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`crmUrl_${item.id}`}
                        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                      >
                        Посилання (URL)
                      </label>
                      <input
                        id={`crmUrl_${item.id}`}
                        name={`crmUrl_${item.id}`}
                        type="url"
                        defaultValue={item.crmUrl || ''}
                        placeholder="https://zachipka.gymsatellite.com/"
                        className="w-full text-xs text-gray bg-gray/5 border border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 px-2.5 py-2 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center justify-between gap-1.5 bg-yellow/20">
                    <input
                      id={`price_${item.id}`}
                      name={`price_${item.id}`}
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={item.price}
                      required
                      title="Вартість"
                      className="w-full text-xl sm:text-2xl font-bold uppercase text-gray bg-transparent text-left focus:outline-none focus:bg-white/50 px-3 py-1.5"
                    />
                    <input
                      id={`period_${item.id}`}
                      name={`period_${item.id}`}
                      type="text"
                      defaultValue={item.period || '/МІС'}
                      required
                      placeholder="/МІС"
                      title="Період або формат"
                      className="w-full text-xl sm:text-2xl font-bold uppercase text-gray/70 bg-transparent focus:outline-none focus:bg-white/50 px-3 py-1.5"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray/10">
                    <ActiveToggle id={item.id} defaultActive={item.isActive} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CLIMBING SECTIONS */}
      <div className="p-6 bg-white flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray/10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray">
              2. Секції ({sections.length})
            </h3>
            <span className="text-xs text-gray/50 uppercase font-semibold">
              (Без ліміту)
            </span>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleAdd('section')}
            className="text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
          >
            + Додати секцію
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {sections.map((item, index) => (
            <div
              key={item.id}
              className="border-2 border-gray/20 bg-gray/5 p-4 sm:p-6 flex flex-col gap-4 relative"
            >
              <div className="flex justify-between items-center border-b border-gray/10 pb-2">
                <span className="text-sm font-bold uppercase text-gray">
                  Секція #{index + 1}: {item.title}
                </span>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(item.id, item.title, 'section')}
                  className="text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50"
                >
                  Видалити секцію
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column: Section details (title, description, CRM URL, price, period, color, visibility) */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor={`title_${item.id}`}
                      className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                    >
                      Назва секції *
                    </label>
                    <textarea
                      id={`title_${item.id}`}
                      name={`title_${item.id}`}
                      defaultValue={item.title}
                      required
                      rows={2}
                      placeholder="НАЗВА СЕКЦІЇ"
                      className="w-full text-xl sm:text-2xl font-bold uppercase leading-tight text-gray bg-white border border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`desc_${item.id}`}
                      className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                    >
                      Опис секції
                    </label>
                    <textarea
                      id={`desc_${item.id}`}
                      name={`desc_${item.id}`}
                      defaultValue={item.description || ''}
                      rows={3}
                      placeholder="Опис секції..."
                      className="w-full text-sm text-gray/80 bg-white border border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2.5 resize-none transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`crmUrl_${item.id}`}
                      className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                    >
                      Посилання (URL)
                    </label>
                    <input
                      id={`crmUrl_${item.id}`}
                      name={`crmUrl_${item.id}`}
                      type="url"
                      defaultValue={item.crmUrl || ''}
                      placeholder="https://zachipka.gymsatellite.com/"
                      className="w-full text-xs text-gray bg-white border border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 px-2.5 py-2 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1.5 bg-yellow/20 p-1">
                    <div className="w-1/2">
                      <label
                        htmlFor={`price_${item.id}`}
                        className="block text-[9px] font-bold uppercase tracking-wider text-gray/50 px-3 pt-1"
                      >
                        Вартість (грн)
                      </label>
                      <input
                        id={`price_${item.id}`}
                        name={`price_${item.id}`}
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={item.price}
                        required
                        className="w-full text-xl font-bold uppercase text-gray bg-transparent text-left focus:outline-none focus:bg-white/50 px-3 pb-1"
                      />
                    </div>
                    <div className="w-1/2 border-l border-gray/10">
                      <label
                        htmlFor={`period_${item.id}`}
                        className="block text-[9px] font-bold uppercase tracking-wider text-gray/50 px-3 pt-1"
                      >
                        Період
                      </label>
                      <input
                        id={`period_${item.id}`}
                        name={`period_${item.id}`}
                        type="text"
                        defaultValue={item.period || 'ГРН/МІС'}
                        required
                        placeholder="ГРН/МІС"
                        className="w-full text-xl font-bold uppercase text-gray/70 bg-transparent focus:outline-none focus:bg-white/50 px-3 pb-1"
                      />
                    </div>
                  </div>

                  {/* Section color selector and visibility toggle */}
                  <div className="flex justify-between items-end">
                    <SectionColorSelector id={item.id} defaultColor={item.color} />
                  <ActiveToggle id={item.id} defaultActive={item.isActive} />
                  </div>
                </div>

                {/* Right column: Section image with drag-and-drop ImageDropzone */}
                <div className="flex flex-col">
                  <ImageDropzone
                    name={`image_${item.id}`}
                    defaultValue={item.image}
                    multiple={false}
                    label="Фото секції (Drag & Drop)"
                    folder="sections"
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SUBSCRIPTIONS & PASSES */}
      <div className="p-6 bg-white flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray/10">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray">
            3. Абонементи (Самостійні відвідування) ({subscriptions.length})
          </h3>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleAdd('subscription')}
            className="text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
          >
            + Додати абонемент
          </button>
        </div>

        {subscriptions.length > 0 && (
          <div className="hidden md:flex items-center gap-4 px-4 text-[10px] font-bold uppercase tracking-wider text-gray/40">
            <span className="w-7">#</span>
            <span className="flex-1">Назва абонемента</span>
            <span className="w-52 text-center">Вартість / Період</span>
            <span className="w-48 text-center">Статус</span>
            <span className="w-16 text-right">Дія</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {subscriptions.map((item, index) => (
            <div
              key={item.id}
              className=" bg-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 transition-colors hover:border-gray/40"
            >
              <span className="text-xs font-bold text-gray/40 w-7 shrink-0 hidden md:inline-block">
                #{index + 1}
              </span>

              <div className="flex-1 min-w-50">
                <label
                  htmlFor={`title_${item.id}`}
                  className="block text-[9px] font-bold uppercase tracking-wider text-gray/40 mb-1 md:hidden"
                >
                  Назва абонемента
                </label>
                <input
                  type="text"
                  id={`title_${item.id}`}
                  name={`title_${item.id}`}
                  defaultValue={item.title}
                  required
                  placeholder="ВВЕДІТЬ НАЗВУ АБОНЕМЕНТА"
                  className="w-full text-base sm:text-lg font-bold uppercase text-gray bg-transparent border-b border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 px-2 py-1 transition-colors"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-3 shrink-0">
                <div className="bg-yellow/20 flex items-center border border-gray/10">
                  <input
                    id={`price_${item.id}`}
                    name={`price_${item.id}`}
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={item.price}
                    required
                    title="Вартість"
                    placeholder="0"
                    className="w-24 sm:w-28 text-base sm:text-lg font-bold uppercase text-gray bg-transparent text-right focus:outline-none focus:bg-white/50 px-2 py-1.5"
                  />
                  <input
                    id={`period_${item.id}`}
                    name={`period_${item.id}`}
                    type="text"
                    defaultValue={item.period || 'ГРН'}
                    required
                    placeholder="ГРН"
                    title="Період або формат"
                    className="w-20 sm:w-24 text-base sm:text-lg font-bold uppercase text-gray/70 bg-transparent text-left focus:outline-none focus:bg-white/50 px-2 py-1.5 border-l border-gray/20"
                  />
                </div>

                <div className="w-auto md:w-48 flex justify-center">
                  <ActiveToggle id={item.id} defaultActive={item.isActive} />
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(item.id, item.title, 'subscription')}
                  className="w-16 text-right text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50 shrink-0"
                  title="Видалити абонемент"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVE / SUBMIT ACTION */}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-gray hover:bg-yellow w-full hover:text-gray text-white text-sm uppercase font-bold tracking-wider px-8 py-4 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </div>
    </form>
  );
}
