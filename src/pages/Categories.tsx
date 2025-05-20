
import { useState, useEffect } from "react";
import { Medicine } from "@/types";
import MedicineCard from "@/components/medicines/MedicineCard";
import { getAllMedicines, getAllCategories } from "@/services/medicineService";
import Navbar from "@/components/layout/Navbar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Categories() {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Medicine Categories</h1>
          <p className="text-muted-foreground">
            Browse medicines by category for faster access
          </p>
          <Separator className="my-4" />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
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
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No medicines found in this category.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
