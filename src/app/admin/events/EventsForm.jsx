'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateEventsAction, deleteEventAction, addEventAction } from './actions';
import ImageDropzone from './ImageDropzone';
import { slugify } from '@/lib/slugify';
import AdminAlert from '@/components/admin/AdminAlert';

function formatDateInput(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function buildSlugWithDate(title, dateVal) {
  const base = slugify(title);
  const datePart = formatDateInput(dateVal);
  if (!base) return datePart || '';
  if (!datePart) return base;
  return base.endsWith(`-${datePart}`) ? base : `${base}-${datePart}`;
}

export default function EventsForm({ initialUpcoming = [], initialPast = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const [slugs, setSlugs] = useState(() => {
    const map = {};
    initialPast.forEach((item) => {
      map[item.id] = item.slug || buildSlugWithDate(item.title, item.eventDate) || '';
    });
    return map;
  });

  const updateSlugForItem = (id, newTitle, newDate) => {
    const titleEl = typeof document !== 'undefined' ? document.getElementById(`title_${id}`) : null;
    const dateEl = typeof document !== 'undefined' ? document.getElementById(`eventDate_${id}`) : null;
    const resolvedTitle = newTitle !== undefined ? newTitle : titleEl?.value || '';
    const resolvedDate = newDate !== undefined ? newDate : dateEl?.value || '';
    const newSlug = buildSlugWithDate(resolvedTitle, resolvedDate);
    setSlugs((prev) => ({
      ...prev,
      [id]: newSlug,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateEventsAction(activeTab, formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Події успішно оновлено в базі даних!' });
        router.refresh();
      }
    });
  };

  const handleDelete = (id, title) => {
    if (!window.confirm(`Видалити подію «${title}»?`)) return;
    setMessage(null);

    startTransition(async () => {
      const res = await deleteEventAction(activeTab, id);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Подію успішно видалено!' });
        router.refresh();
      }
    });
  };

  const handleAdd = () => {
    if (!window.confirm(`Створити нову подію ?`)) return;
    setMessage(null);

    startTransition(async () => {
      const res = await addEventAction(activeTab);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Нову подію успішно створено!' });
        router.refresh();
      }
    });
  };

  // ---------------------------------------------------------------------------
  // TAB 1: Upcoming Events Form Renderer
  // ---------------------------------------------------------------------------
  const renderUpcomingSection = () => (
    <div className="p-6 bg-white flex flex-col gap-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-bold uppercase tracking-wider text-gray pb-2">
        Найближчі події
      </h3>
      <button
                type="button"
                disabled={isPending}
                onClick={() => handleAdd()}
                className="ml-auto text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
              >
                + Додати подію
              </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialUpcoming.map((item) => (
          <div
            key={item.id}
            className="border border-gray/10 bg-white p-4 sm:p-6 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor={`title_${item.id}`}
                  className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                >
                  Назва події
                </label>
                <input
                  id={`title_${item.id}`}
                  name={`title_${item.id}`}
                  type="text"
                  defaultValue={item.title}
                  required
                  placeholder="ВВЕДІТЬ НАЗВУ"
                  className="w-full text-xl sm:text-2xl font-bold uppercase leading-tight text-gray bg-transparent border-b border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 transition-colors pb-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`eventDate_${item.id}`}
                    className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                  >
                    Дата початку
                  </label>
                  <input
                    id={`eventDate_${item.id}`}
                    name={`eventDate_${item.id}`}
                    type="date"
                    defaultValue={formatDateInput(item.eventDate)}
                    required
                    className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`endDate_${item.id}`}
                    className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                  >
                    Дата кінця (якщо діапазон)
                  </label>
                  <input
                    id={`endDate_${item.id}`}
                    name={`endDate_${item.id}`}
                    type="date"
                    defaultValue={formatDateInput(item.endDate)}
                    className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`shortDescription_${item.id}`}
                  className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                >
                  Короткий опис
                </label>
                <textarea
                  id={`shortDescription_${item.id}`}
                  name={`shortDescription_${item.id}`}
                  defaultValue={item.shortDescription}
                  rows={2}
                  placeholder="Короткий опис події..."
                  className="w-full text-sm text-gray/80 bg-transparent border border-dashed border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2.5 resize-none transition-colors"
                />
              </div>
              <ImageDropzone
                name={`coverImage_${item.id}`}
                label="Афіша події"
                defaultValue={item.coverImage}
                multiple={false}
                folder={`upcoming-${item.id}`}
                className="h-full"
              />
              <div>
                <label
                  htmlFor={`crmUrl_${item.id}`}
                  className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                >
                  Посилання на CRM (якщо порожнє — статус «Скоро»)
                </label>
                <input
                  id={`crmUrl_${item.id}`}
                  name={`crmUrl_${item.id}`}
                  type="text"
                  defaultValue={item.crmUrl}
                  placeholder="https://zachipka.gymsatellite.com/client_book_spot_event/booking_event_basics"
                  className="w-full text-sm text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/10"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-gray/10">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-gray">
                <input
                  type="checkbox"
                  name={`isActive_${item.id}`}
                  defaultChecked={item.isActive}
                  className="w-4 h-4 accent-gray cursor-pointer"
                />
                Активна (показувати)
                {item.eventDate && new Date(item.eventDate) <= new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <span className="text-[10px] lowercase font-semibold text-red bg-red/10 px-1.5 py-0.5">
                    (день події настав)
                  </span>
                )}
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(item.id, item.title)}
                className="ml-auto text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // TAB 2: Past Events Form Renderer (includes cover image, photo gallery, details)
  // ---------------------------------------------------------------------------
  const renderPastSection = () => (
    <div className="p-6 bg-white flex flex-col gap-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-bold uppercase tracking-wider text-gray pb-2">
        Минулі події
      </h3>
      <button
                type="button"
                disabled={isPending}
                onClick={() => handleAdd()}
                className="ml-auto text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
              >
                + Додати подію
              </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {initialPast.map((item) => (
          <div
            key={item.id}
            className="border border-gray/10 bg-white p-4 sm:p-6 flex flex-col gap-4"
          >
            {/* Hidden slug auto-generated from title and start date */}
            <input
              id={`slug_${item.id}`}
              name={`slug_${item.id}`}
              type="hidden"
              value={
                slugs[item.id] !== undefined
                  ? slugs[item.id]
                  : item.slug || buildSlugWithDate(item.title, item.eventDate)
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left column: Event title (top) and date range pickers (bottom) */}
              <div className="flex flex-col justify-between gap-3">
                <div>
                  <label
                    htmlFor={`title_${item.id}`}
                    className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                  >
                    Назва події
                  </label>
                  <input
                    id={`title_${item.id}`}
                    name={`title_${item.id}`}
                    type="text"
                    defaultValue={item.title}
                    onChange={(e) => updateSlugForItem(item.id, e.target.value, undefined)}
                    required
                    className="w-full text-xl sm:text-2xl font-bold uppercase text-gray bg-transparent border-b border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 pb-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`eventDate_${item.id}`}
                      className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                    >
                      Дата початку
                    </label>
                    <input
                      id={`eventDate_${item.id}`}
                      name={`eventDate_${item.id}`}
                      type="date"
                      defaultValue={formatDateInput(item.eventDate)}
                      onChange={(e) => updateSlugForItem(item.id, undefined, e.target.value)}
                      required
                      className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`endDate_${item.id}`}
                      className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                    >
                      Дата кінця (якщо діапазон)
                    </label>
                    <input
                      id={`endDate_${item.id}`}
                      name={`endDate_${item.id}`}
                      type="date"
                      defaultValue={formatDateInput(item.endDate)}
                      className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                    />
                  </div>
                </div>
              </div>

              {/* Right column: Main cover image (coverImage) */}
              <div className="flex flex-col h-full">
                <ImageDropzone
                  name={`coverImage_${item.id}`}
                  label="Головне фото (coverImage)"
                  defaultValue={item.coverImage}
                  multiple={false}
                  folder={slugs[item.id] || item.slug || item.id}
                  slugInputId={`slug_${item.id}`}
                  className="h-full"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`shortDescription_${item.id}`}
                className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
              >
                Короткий опис
              </label>
              <textarea
                id={`shortDescription_${item.id}`}
                name={`shortDescription_${item.id}`}
                defaultValue={item.shortDescription}
                rows={2}
                className="w-full text-sm text-gray/80 bg-transparent border border-dashed border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2.5 resize-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor={`content_${item.id}`}
                className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
              >
                Повний опис / звіт (content)
              </label>
              <textarea
                id={`content_${item.id}`}
                name={`content_${item.id}`}
                defaultValue={item.content}
                rows={6}
                className="w-full text-sm text-gray/80 bg-transparent border border-dashed border-gray/20 hover:border-gray/50 focus:border-gray focus:outline-none focus:bg-yellow/10 p-2.5 resize-y transition-colors"
              />
            </div>

            <div>
              <ImageDropzone
                name={`gallery_${item.id}`}
                label="Галерея фото"
                defaultValue={item.gallery}
                multiple={true}
                folder={slugs[item.id] || item.slug || item.id}
                slugInputId={`slug_${item.id}`}
              />
            </div>

            <div className="flex items-center pt-2 border-t border-gray/10">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-gray">
                <input
                  type="checkbox"
                  name={`isFeatured_${item.id}`}
                  defaultChecked={item.isFeatured}
                  className="w-4 h-4 accent-gray cursor-pointer"
                />
                Показувати в слайдері
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(item.id, item.title)}
                className="ml-auto text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex border-b border-gray/15">
        <button
          type="button"
          onClick={() => {
            setActiveTab('upcoming');
            setMessage(null);
          }}
          className={`px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-gray text-white'
              : 'bg-white text-gray/60 hover:text-gray'
          }`}
        >
          1. Найближчі події ({initialUpcoming.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('past');
            setMessage(null);
          }}
          className={`px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'past'
              ? 'bg-gray text-white'
              : 'bg-white text-gray/60 hover:text-gray'
          }`}
        >
          2. Минулі події ({initialPast.length})
        </button>
      </div>

      <AdminAlert message={message} onClose={() => setMessage(null)} />

      <form key={activeTab} onSubmit={handleSubmit} className="flex flex-col gap-8">
        {activeTab === 'upcoming' ? renderUpcomingSection() : renderPastSection()}

        <div className="flex items-center w-full gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-gray hover:bg-yellow w-full hover:text-gray text-white text-sm uppercase font-bold tracking-wider px-8 py-4 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
}