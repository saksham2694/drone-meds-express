
import Navbar from "@/components/layout/Navbar";
import MedicineGrid from "@/components/medicines/MedicineGrid";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <section className="mb-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Quick Medicine Delivery by Drone
            </h1>
            <p className="text-lg text-muted-foreground">
              Get your essential medications delivered in minutes, not hours.
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden mb-12 bg-primary/5">
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-3xl font-bold mb-4">Fast Drone Delivery</h2>
                <p className="text-lg mb-6">
                  Our drones get your medicine to your doorstep in minutes.
                  Perfect for emergencies and regular medication needs.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img
                  src="/lovable-uploads/e29d581d-e971-4236-9b9b-e9aa5e2db86a.png"
                  alt="Medicine Drone Delivery"
                  className="max-w-full h-auto rounded shadow-lg animate-drone-fly"
                  style={{ maxHeight: "300px" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Available Medicines
            </h2>
          </div>
          <MedicineGrid />
        </section>
      </main>
    </div>
  );
}
