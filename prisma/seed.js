const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const initialUpcomingEvents = [
  {
    id: 'up_1',
    title: 'Відкрите тренування для новачків',
    shortDescription: 'Знайомство зі скеледромом, базові техніки лазіння та страховки під наглядом інструктора.',
    eventDate: new Date('2026-03-22T12:00:00Z'),
    isInCrm: true,
    crmUrl: 'https://zachipka.gymsatellite.com/client_book_spot_event/booking_event_basics',
    isActive: true,
  },
  {
    id: 'up_2',
    title: 'Фестиваль боулдерингу для всіх',
    shortDescription: 'Дводенний марафон із 30 новими трасами різної складності та крутою атмосферою.',
    eventDate: new Date('2026-03-22T10:00:00Z'),
    isInCrm: true,
    crmUrl: 'https://zachipka.gymsatellite.com/client_book_spot_event/booking_event_basics',
    isActive: true,
  },
  {
    id: 'up_3',
    title: 'Майстер-клас з роботи ніг',
    shortDescription: 'Вчимося стояти на мізерах, правильно розподіляти вагу та економити сили рук.',
    eventDate: new Date('2026-03-29T18:00:00Z'),
    isInCrm: false,
    crmUrl: '',
    isActive: true,
  },
  {
    id: 'up_4',
    title: 'Дитячі змагання Kids Cup',
    shortDescription: 'Дружні старти для юних скелелазів віком від 6 до 14 років з подарунками.',
    eventDate: new Date('2026-04-05T11:00:00Z'),
    isInCrm: false,
    crmUrl: '',
    isActive: true,
  },
  {
    id: 'up_5',
    title: 'Вечірнє фанове лазіння + DJ сет',
    shortDescription: 'Лазимо під музику у колі друзів, обговорюємо пролази та п’ємо чай.',
    eventDate: new Date('2026-04-12T19:00:00Z'),
    isInCrm: true,
    crmUrl: 'https://zachipka.gymsatellite.com/client_book_spot_event/booking_event_basics',
    isActive: true,
  },
];

const initialPastEvents = [
  {
    id: 'past_1',
    slug: 'stantsiya',
    title: 'СТАНЦІЯ',
    eventDate: new Date('2026-02-15T12:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438444/events/stanciya/t0eap0zixuoqe88f3tf9.jpg',
    shortDescription: 'Масштабний зимовий контест із крутими трасами та неймовірною підтримкою.',
    content:
      'Понад 80 учасників зі всієї України зібралися в «Зачіпці», щоб випробувати свіже накручення від нашої команди рутсетерів. Протягом усього дня в залі панувала неймовірна атмосфера спортивного азарту, взаємної підтримки та справжнього драйву.\n\nКваліфікаційний раунд складався з 25 боулдерів різного профілю: від делікатних трас на баланс і роботу ніг до потужних силових нависань і видовищних стрибків-дайно. Кожен учасник — від початківців, які лише нещодавно відкрили для себе скелелазіння, до досвідчених спортсменів — знайшов свої виклики та особисті перемоги.\n\nУ вечірніх фіналах під світлом прожекторів та гучні оплески глядачів найсильніші атлети боролися за кожен перехват до останньої секунди. Дякуємо кожному учаснику, глядачам та нашим партнерам за цю шалену енергетику!',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438446/events/stanciya/tpwpsevojh2tgrycq1tf.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438447/events/stanciya/kb4m5q9szmpaxu40qpjd.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438447/events/stanciya/ljc5ckfwzh56swrdovys.jpg',
    ],
    isFeatured: true,
  },
  {
    id: 'past_2',
    slug: 'festyval',
    title: 'ФЕСТИВАЛЬ',
    eventDate: new Date('2026-01-28T12:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438449/events/festyval/jrotvznkofvh6x344gnh.jpg',
    shortDescription: 'Свято скелелазіння для новачків та досвідчених спортсменів.',
    content:
      'Зимовий Фестиваль у «Зачіпці» об’єднав усіх, хто не уявляє своїх вихідних без магнезії, крутих рухів і хорошої компанії. Протягом двох днів наш зал перетворився на великий простір для спілкування, обміну досвідом та фанового лазіння без зайвого стресу.\n\nМи підготували спеціальні фестивальні маршрути з незвичними механіками: парні траси на взаємодію, швидкісні дуелі та секретні бонусні зачіпки. Окремий залік для категорії «Перший старт» дозволив новачкам відчути смак змагань у максимально дружній атмосфері.\n\nПісля основних сетів на всіх чекала лаунж-зона з гарячим чаєм, розіграшем мерчу та спорядження від спонсорів і традиційний перегляд відео найкращих пролазів дня.',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438450/events/festyval/wqpno3brbawv4wphfj1c.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438451/events/festyval/s9ss15km9dx2c7lzka2u.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438451/events/festyval/pmop6bgtmon185p3onrc.jpg',
    ],
    isFeatured: false,
  },
  {
    id: 'past_3',
    slug: 'vidkryttya',
    title: 'ВІДКРИТТЯ',
    eventDate: new Date('2025-12-12T12:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438452/events/vidkryttya/pqb4yyuwc0qtougmwimu.jpg',
    shortDescription: 'Офіційне відкриття оновленого сектору та презентація нових площин.',
    content:
      'Ми довго готувалися до цього дня і нарешті презентували нашій спільноті повністю оновлений сектор скеледрому! Нові кути нахилу, сотні свіжих рельєфів та зачіпок провідних світових брендів і ще більше простору для різноманітних рухів.\n\nУ день відкриття кожен гість зміг першим протестувати понад 40 абсолютно нових маршрутів усіх категорій складності. Наші тренери проводили відкриті експрес-розбори складних ключів, допомагаючи знайти оптимальні розкладки для різних зростів і стилів лазіння.\n\nВечір завершився святковим фуршетом, музичним сетом і теплими розмовами про майбутні проєкти та тренувальні цілі на новий сезон.',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438453/events/vidkryttya/fpjsjpitrnghph8bhhcq.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438454/events/vidkryttya/hh5pqyr0bvxxumlf4smy.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438454/events/vidkryttya/uh1p3ozubydtefkqlccl.jpg',
    ],
    isFeatured: false,
  },
  {
    id: 'past_4',
    slug: 'boulder-batl',
    title: 'БОУЛДЕР БАТЛ',
    eventDate: new Date('2025-11-22T12:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438455/events/boulder-batl/ng6yk3roic5drvkhhaww.jpg',
    shortDescription: 'Динамічні дуелі у форматі батлу до останнього топу.',
    content:
      'Формат «Боулдер Батл» — це чистий адреналін, де все вирішується тут і зараз. Жодних довгих очікувань: раунди на вибування, обмежений час на спробу і пряма дуель характерів та техніки на очах у всього залу.\n\nРутсетери підготували видовищні координаційні проблеми, де вирішальну роль відігравали не лише сила пальців, а й уміння швидко читати рельєф, ризикувати та зберігати холоднокровність під тиском таймера.\n\nГлядацька підтримка була настільки гучною, що її було чути далеко за межами скеледрому. Вітаємо переможців і дякуємо кожному, хто вийшов на старт і показав красиву боротьбу до останньої секунди!',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438456/events/boulder-batl/sukzmoksuroonv1dbkru.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438457/events/boulder-batl/x6uo8xxhr34klnn3hyrr.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438457/events/boulder-batl/ijhuruhsrs6xwfqeqz9k.jpg',
    ],
    isFeatured: false,
  },
  {
    id: 'past_5',
    slug: 'nichne-lazinnya',
    title: 'НІЧНЕ ЛАЗІННЯ',
    eventDate: new Date('2025-10-31T19:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438458/events/nichne-lazinnya/gx3estt1y0eq5xfoapog.jpg',
    shortDescription: 'Тематична вечірка та лазіння з ліхтариками у темряві.',
    content:
      'Коли гасне основне світло залу, знайомі стіни «Зачіпки» відкриваються з абсолютно іншого боку! Наше традиційне Нічне лазіння з налобними ліхтариками та неоновою розміткою зачіпок подарувало всім учасникам незабутній досвід.\n\nЛазіння у промені ліхтарика вимагає максимальної концентрації на кожному русі та довіри до власних відчуттів балансу. Окрім основних трас, на учасників чекали тематичні конкурси на найкращий образ вечора, фанові челенджі на витривалість та атмосферний плейлист.\n\nЦей вечір вкотре довів, що скелелазіння — це не лише про спорт і тренування, а насамперед про круту спільноту та яскраві спільні емоції.',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438459/events/nichne-lazinnya/itobsgyfcszmqsvyxq5g.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438459/events/nichne-lazinnya/so9s5cq5q3nxlcnlejiq.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438460/events/nichne-lazinnya/rzuo8ozqxot65zpmm8ju.jpg',
    ],
    isFeatured: false,
  },
  {
    id: 'past_6',
    slug: 'mayster-klas',
    title: 'МАЙСТЕР-КЛАС',
    eventDate: new Date('2025-09-14T14:00:00Z'),
    coverImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438461/events/mayster-klas/kyxmn2hcfps30oo7nyyk.jpg',
    shortDescription: 'Практичний інтенсив із техніки проходження силових та нависаючих трас.',
    content:
      'Чотиригодинний практичний інтенсив для тих, хто хоче перейти на новий рівень складності та навчитися ефективно працювати на крутих нависаннях. Разом із нашими провідними тренерами ми детально розібрали біомеханіку складних рухів.\n\nУ програмі майстер-класу ми сфокусусувалися на роботі корпусу, правильних скручуваннях (drop-knee), активному використанні п’ят та носків, а також на генерації імпульсу від ніг під час виконання динамічних перехоплень.\n\nКожен учасник отримав індивідуальний відеорозбір своїх пролазів, попрацював над власними слабкими місцями та забрав із собою чіткий план спеціальних вправ для подальших самостійних тренувань.',
    gallery: [
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438462/events/mayster-klas/xm1qj65coacv6sgq9qrw.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438463/events/mayster-klas/qljdwiahkpfwyob6wwke.jpg',
      'https://res.cloudinary.com/uaz78d3k/image/upload/v1792438463/events/mayster-klas/c4xysrj0lhikmj68nvij.jpg',
    ],
    isFeatured: false,
  },
];

const initialTeam = [
  {
    id: 'team_1',
    name: 'Бобеня Ярослав',
    position: 'тренер',
    firstImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1793199369/hquhdyv1so2x0v7fti4x.jpg',
    lastImage: 'https://res.cloudinary.com/uaz78d3k/image/upload/v1793199369/uy0s9m9pr7eaqwtlba1e.jpg',
  }
]

async function main() {
  console.log('Початок наповнення команди...');
  for (const person of initialTeam) {
    await prisma.team.upsert({
      where: { id: person.id },
      update: person,
      create: person,
    });
  }
  console.log('Успішно заповнено команду!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });