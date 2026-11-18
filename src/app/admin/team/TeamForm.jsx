'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateTeamAction, deleteTeamAction, addTeamAction } from './actions';
import ImageDropzone from '../events/ImageDropzone';
import AdminAlert from '@/components/admin/AdminAlert';

export default function TeamForm({ initialTeam = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const addFormRef = useRef(null);

  const handleUpdate = (e) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateTeamAction(formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Зміни в команді успішно збережено!' });
        router.refresh();
      }
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addTeamAction(formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Нового тренера успішно додано!' });
        setIsAdding(false);
        addFormRef.current?.reset();
        router.refresh();
      }
    });
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Видалити учасника «${name}»?`)) return;
    setMessage(null);

    startTransition(async () => {
      const res = await deleteTeamAction(id);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Учасника успішно видалено!' });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminAlert message={message} onClose={() => setMessage(null)} />

      <div className="p-6 bg-white flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray pb-2">
            Список учасників ({initialTeam.length})
          </h3>

          {!isAdding && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsAdding(true)}
              className="ml-auto text-xs font-bold uppercase tracking-wider text-green-700 hover:underline cursor-pointer disabled:opacity-50"
            >
              + Додати тренера
            </button>
          )}
        </div>

        {/* SECTION: Add New Team Member Form */}
        {isAdding && (
          <form
            ref={addFormRef}
            onSubmit={handleCreate}
            className="border-2 border-yellow bg-yellow/5 p-4 sm:p-6 flex flex-col gap-4 mb-4"
          >
            <div className="flex justify-between items-center border-b border-gray/10 pb-2">
              <span className="text-sm font-bold uppercase text-gray">
                Новий учасник команди
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1">
                  Ім&apos;я та прізвище *
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="ВВЕДІТЬ ІМ'Я"
                  required
                  className="w-full text-xl sm:text-2xl font-bold uppercase leading-tight text-gray bg-transparent border-b border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 transition-colors pb-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1">
                    Посада *
                  </label>
                  <input
                    name="position"
                    type="text"
                    placeholder="НАПР. ТРЕНЕР"
                    required
                    className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1">
                    Індекс (порядок)
                  </label>
                  <input
                    name="orderIndex"
                    type="number"
                    step="1"
                    defaultValue={initialTeam.length + 1}
                    className="w-full text-sm font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <ImageDropzone
                name="firstImage"
                label="Головне фото *"
                multiple={false}
                folder="team"
              />
              <ImageDropzone
                name="lastImage"
                label="Друге фото (hover) *"
                multiple={false}
                folder="team"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                disabled={isPending}
                className="text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-gray hover:bg-yellow hover:text-gray text-white text-xs uppercase font-bold tracking-wider px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Збереження...' : 'Додати в команду'}
              </button>
            </div>
          </form>
        )}

        {/* SECTION: Existing Team Members Roster & Inline Editing */}
        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
          {initialTeam.length === 0 && !isAdding && (
            <div className="text-gray/50 py-10 text-center uppercase tracking-wider text-sm border border-dashed border-gray/20">
              Тренерів ще не додано.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialTeam.map((item, idx) => (
              <div
                key={item.id}
                className="border border-gray/10 bg-white p-4 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`orderIndex_${item.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-gray/50"
                      >
                        Індекс:
                      </label>
                      <input
                        id={`orderIndex_${item.id}`}
                        name={`orderIndex_${item.id}`}
                        type="number"
                        step="1"
                        defaultValue={item.orderIndex ?? idx}
                        className="w-16 text-xs font-bold text-gray bg-gray/5 border border-gray/20 px-2 py-1 focus:outline-none focus:border-gray focus:bg-yellow/20"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(item.id, item.name)}
                      className="ml-auto text-xs font-bold uppercase tracking-wider text-red hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Видалити
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label
                        htmlFor={`name_${item.id}`}
                        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                      >
                        Ім&apos;я та прізвище
                      </label>
                      <input
                        id={`name_${item.id}`}
                        name={`name_${item.id}`}
                        type="text"
                        defaultValue={item.name}
                        required
                        placeholder="ВВЕДІТЬ ІМ'Я"
                        className="w-full text-xl sm:text-2xl font-bold uppercase leading-tight text-gray bg-transparent border-b border-gray/20 focus:border-gray focus:outline-none focus:bg-yellow/10 transition-colors pb-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`position_${item.id}`}
                        className="block text-[10px] font-bold uppercase tracking-wider text-gray/40 mb-1"
                      >
                        Посада
                      </label>
                      <input
                        id={`position_${item.id}`}
                        name={`position_${item.id}`}
                        type="text"
                        defaultValue={item.position}
                        required
                        placeholder="НАПР. ТРЕНЕР"
                        className="w-full text-sm uppercase font-bold text-gray bg-gray/5 px-3 py-2 focus:outline-none focus:bg-yellow/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                    <div className="flex flex-col gap-2">
                      {item.firstImage && (
                        <div className="relative w-full aspect-3/4 max-h-96 overflow-hidden bg-black/5 border border-gray/10">
                          <Image
                            src={item.firstImage}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <ImageDropzone
                        name={`firstImage_${item.id}`}
                        label="Головне фото"
                        defaultValue={item.firstImage}
                        multiple={false}
                        folder="team"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      {item.lastImage && (
                        <div className="relative w-full aspect-3/4 max-h-96 overflow-hidden bg-black/5 border border-gray/10">
                          <Image
                            src={item.lastImage}
                            alt={`${item.name} hover`}
                            fill
                            sizes="(max-width: 640px) 100vw, 400px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <ImageDropzone
                        name={`lastImage_${item.id}`}
                        label="Друге фото (hover)"
                        defaultValue={item.lastImage}
                        multiple={false}
                        folder="team"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
    </div>
  );
}