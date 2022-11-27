import { Input } from "@/components/UI";
import { Rank } from "@/components/UI/Layout";
import { FC, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { DWARFS, PERK_UID, PROMO_RANKS, UUIDS, XP_TABLE } from "../../constant";
import { useChangesStore } from "../../stores/changesStore";
import { useFilterStore } from "../../stores/filterStore";
import { useSaveStore } from "../../stores/saveStore";
import { Dropdown } from "./Dropdown";
import Filters from "./filter/Filters";
import { Overclocks } from "./overclocks";

const XP_OFFSET = 26;
const CLASS_UID = "030000005850";

const xpToLevel = (xp: number) => {
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp < XP_TABLE[i]) {
      return { level: i, xp: xp - XP_TABLE[i - 1] };
    }
  }
  return { level: 25, xp: 0 };
};

export const Dwarf: FC = () => {
  const { dwarf } = useParams<{ dwarf: DWARFS }>();
  if (!dwarf) {
    return <Navigate to="/" replace />;
  }
  const DWARF_UID = UUIDS[dwarf] + CLASS_UID;
  const { save, setSave } = useSaveStore();
  const { increment } = useChangesStore();
  const { clearFilters } = useFilterStore();

  const [level, setLevel] = useState(
    () => xpToLevel(save.getInt32(DWARF_UID, XP_OFFSET)).level
  );
  const [xp, setXp] = useState(
    () => xpToLevel(save.getInt32(DWARF_UID, XP_OFFSET)).xp
  );

  const [promotion, setPromotion] = useState(() =>
    save.getInt32(DWARF_UID, XP_OFFSET + 108)
  );

  // Perks points are shared between all dwarfs, maybe move this somewhere else?
  const [perks, setPerks] = useState(() => {
    const points = save.getInt32(PERK_UID, 26);
    return points > 0 ? points : 0;
  });

  useEffect(() => {
    return () => {
      clearFilters();
    };
  }, []);

  const handleLevelChange = (value: number) => {
    if (value < 1) {
      value = 1;
    }
    if (value >= 25) {
      value = 25;
      setXp(0);
    }
    setLevel(value);
    increment();
    save.setInt32(DWARF_UID, XP_OFFSET, XP_TABLE[value - 1] + xp);
    setSave(save);
    console.log({ level: value, xp, total: XP_TABLE[value - 1] + xp });
  };

  const handleXpChange = (value: number) => {
    if (value > XP_TABLE[level]) {
      value = XP_TABLE[level];
    }
    setXp(value);
    increment();
    save.setInt32(DWARF_UID, XP_OFFSET, XP_TABLE[level - 1] + value);
    console.log({ level, xp: value, total: XP_TABLE[level - 1] + value });
    setSave(save);
  };

  const handlePromotionChange = (value: number) => {
    setPromotion(value);
    increment();
    save.setInt32(DWARF_UID, XP_OFFSET + 108, value);
    setSave(save);
  };

  const handlePerkChange = (value: number) => {
    setPerks(value);
    increment();
    save.setInt32(PERK_UID, 26, value);
    setSave(save);
  };

  return (
    <div className="w-full ">
      <Rank>
        <>
          <Input
            name="Level"
            initialValue={level}
            icon={`${import.meta.env.BASE_URL}assets/level.webp`}
            max={25}
            onChange={handleLevelChange}
          />
          <Input
            name="Progress"
            initialValue={xp}
            label="XP"
            max={XP_TABLE[level] - XP_TABLE[level - 1] || undefined}
            onChange={handleXpChange}
          />
          <Dropdown
            items={PROMO_RANKS}
            name="Promotion"
            initialValue={promotion}
            onChange={handlePromotionChange}
          />
          <Input
            name="Perks Points"
            initialValue={perks}
            icon={`${import.meta.env.BASE_URL}assets/perks.webp`}
            max={0x0fffffff}
            onChange={handlePerkChange}
          />
        </>
      </Rank>
      <div className="not-first:mt-10 relative">
        <Filters dwarf={dwarf} />
        <span className="border-b-2 border-drg-primary-500 capitalize text-sm">
          Overclocks
        </span>
        <div className="mt-3 md:w-auto max-h-96 overflow-auto drg-scrollbar drg-internal-scrollbar">
          <div className="mr-4 grid grid-cols gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 relative">
            <Overclocks dwarf={dwarf} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dwarf;