import Button from "../ui/Button";

const CARD_STYLES = [
  { bg: "bg-yellow", text: "text-gray", priceText: "text-gray" },
  { bg: "bg-red", text: "text-white", priceText: "text-white" },
  { bg: "bg-gray", text: "text-yellow", priceText: "text-white" },
  { bg: "bg-purple", text: "text-white", priceText: "text-white" },
  { bg: "bg-orange", text: "text-white", priceText: "text-white" },
  { bg: "bg-blue", text: "text-white", priceText: "text-white" },
];

function getPackageRows(packages) {
  const n = packages.length;
  if (n <= 1) {
    return [{ items: packages, cols: "grid-cols-1" }];
  }
  if (n === 2) {
    return [{ items: packages, cols: "grid-cols-1 md:grid-cols-2" }];
  }
  if (n === 3) {
    return [{ items: packages, cols: "grid-cols-1 lg:grid-cols-3" }];
  }
  if (n === 4) {
    return [
      { items: packages.slice(0, 2), cols: "grid-cols-1 md:grid-cols-2" },
      { items: packages.slice(2, 4), cols: "grid-cols-1 md:grid-cols-2" },
    ];
  }
  if (n === 5) {
    return [
      { items: packages.slice(0, 3), cols: "grid-cols-1 md:grid-cols-3" },
      { items: packages.slice(3, 5), cols: "grid-cols-1 md:grid-cols-2" },
    ];
  }
  // 6 or more
  return [
    { items: packages.slice(0, 3), cols: "grid-cols-1 md:grid-cols-3" },
    { items: packages.slice(3, 6), cols: "grid-cols-1 md:grid-cols-3" },
  ];
}

export default function PopularPackages({ packagesData = [] }) {
  const itemsWithIndex = packagesData.map((pkg, idx) => ({
    ...pkg,
    originalIndex: idx,
  }));
  const rows = getPackageRows(itemsWithIndex);

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div>
            <h3 className="text-red uppercase tracking-wider font-bold text-sm mb-4 sm:mb-8">
              Популярні пакети
            </h3>

            <h2 className="text-gray uppercase leading-tight font-bold">
              ВИ В НАС
              <br />
              ВПЕРШЕ?
            </h2>
          </div>

          <p className="max-w-md text-gray text-sm sm:text-base lg:pb-2">
            Обери один із популярних пакетів, щоб познайомитись із
            скелелазінням та простором Зачіпки.
          </p>
        </div>

        <div className="flex flex-col">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className={`grid ${row.cols}`}>
              {row.items.map((pkg) => {
                const style = CARD_STYLES[pkg.originalIndex % CARD_STYLES.length];
                return (
                  <div key={pkg.id} className={`overflow-hidden ${style.bg}`}>
                    <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-65 sm:min-h-85 h-full">
                      <div>
                        <h4
                          className={`text-3xl sm:text-4xl font-bold uppercase leading-tight mb-4 wrap-break-word ${style.text}`}
                        >
                          {pkg.title}
                        </h4>
                        {pkg.description && (
                          <p className={`text-sm sm:text-base max-w-md ${style.text}`}>
                            {pkg.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-6 sm:mt-8 pt-4">
                        <Button
                          href={pkg.crmUrl?.trim() || "https://zachipka.gymsatellite.com/client_book_time/locations"}
                          bg="white"
                          color="gray"
                          uppercase
                        >
                          Записатись
                        </Button>
                        <span
                          className={`text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight ${style.priceText}`}
                        >
                          {pkg.price} {pkg.period}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
