
import { useEffect, useState } from "react";
import { Medicine } from "@/types";
import MedicineCard from "./MedicineCard";
import { getAllMedicines, getAllCategories } from "@/services/medicineService";
import { Button } from "@/components/ui/button";

export default function MedicineGrid() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [medicinesData, categoriesData] = await Promise.all([
          getAllMedicines(),
          getAllCategories(),
        ]);
        setMedicines(medicinesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load medicines", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredMedicines = selectedCategory
    ? medicines.filter((med) => med.category === selectedCategory)
    : medicines;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-muted rounded-md animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
}
