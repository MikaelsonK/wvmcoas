"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function YearFilter({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("year", value);
    } else {
      params.delete("year");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={defaultValue}
      onChange={handleChange}
      className="px-2.5 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red transition-colors cursor-pointer"
    >
      <option value="">All Years</option>
      {[1, 2, 3, 4].map((y) => (
        <option key={y} value={y.toString()}>
          Year {y}
        </option>
      ))}
    </select>
  );
}
