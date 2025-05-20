
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Medicine } from "@/types";
import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  checkIsAdmin,
  makeUserAdmin
} from "@/services/medicineService";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import UserAdminManager from "@/components/admin/UserAdminManager";

export default function AdminPage() {
  console.log("Admin component rendering"); // Debug log
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<Omit<Medicine, "id"> & { id?: string }>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
    },
  });

  // Debug the user authentication state
  useEffect(() => {
    console.log("Admin component - user state:", user);
  }, [user]);

  // Check if user is admin and load medicines
  useEffect(() => {
    const checkAdmin = async () => {
      console.log("Checking admin status, user:", user); // Debug log
      
      if (!user) {
        console.log("No user found, redirecting to home"); // Debug log
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        console.log("Calling checkIsAdmin with ID:", user.id); // Debug log
        const adminStatus = await checkIsAdmin(user.id);
        console.log("Admin status result:", adminStatus); // Debug log
        
        if (!adminStatus) {
          try {
            // Try to make the user admin
            console.log("Attempting to make user admin"); // Debug log
            const madeAdmin = await makeUserAdmin(user.id);
            console.log("Make admin result:", madeAdmin); // Debug log
            
            if (!madeAdmin) {
              console.log("Failed to make admin, showing toast and redirecting"); // Debug log
              toast({
                title: "Access Denied",
                description: "You don't have permission to access this page.",
                variant: "destructive",
              });
              navigate("/");
              return;
            }
            setIsAdmin(true);
          } catch (error) {
            console.error("Error making user admin:", error);
            toast({
              title: "Access Denied",
              description: "Failed to grant admin access.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
        } else {
          console.log("User is admin, setting state"); // Debug log
          setIsAdmin(true);
        }
        
        console.log("Loading medicines"); // Debug log
        await loadMedicines();
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin status. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, navigate, toast]);

  // Load medicines
  const loadMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data);
      setFilteredMedicines(data);
      return true;
    } catch (error) {
      console.error("Error loading medicines:", error);
      toast({
        title: "Error",
        description: "Failed to load medicines. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Filter medicines based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMedicines(medicines);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(term) ||
          medicine.description.toLowerCase().includes(term) ||
          medicine.category.toLowerCase().includes(term)
      );
      setFilteredMedicines(filtered);
    }
  }, [searchTerm, medicines]);

  // Open dialog for adding/editing medicine
  const openEditDialog = (medicine?: Medicine) => {
    if (medicine) {
      form.reset({
        id: medicine.id,
        name: medicine.name,
        description: medicine.description,
        price: medicine.price,
        imageUrl: medicine.imageUrl,
        category: medicine.category,
      });
      setEditingMedicine(medicine);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        category: "",
      });
      setEditingMedicine(null);
    }
    setOpenDialog(true);
  };

  // Handle form submission for adding/editing medicine
  const onSubmit = async (data: Omit<Medicine, "id"> & { id?: string }) => {
    try {
      if (editingMedicine) {
        // Update existing medicine
        await updateMedicine({
          id: editingMedicine.id,
          name: data.name,
          description: data.description,
          price: Number(data.price),
          imageUrl: data.imageUrl,
          category: data.category,
        });
        toast({
          title: "Success",
          description: `${data.name} has been updated.`,
        });
      } else {
        // Add new medicine
        await addMedicine({
          name: data.name,
          description: data.description,
          price: Number(data.price),
          imageUrl: data.imageUrl,
          category: data.category,
        });
        toast({
          title: "Success",
          description: `${data.name} has been added to the medicines list.`,
        });
      }
      setOpenDialog(false);
      loadMedicines();
    } catch (error) {
      console.error("Error saving medicine:", error);
      toast({
        title: "Error",
        description: "Failed to save medicine. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle medicine deletion
  const handleDelete = async () => {
    if (!medicineToDelete) return;

    try {
      await deleteMedicine(medicineToDelete);
      toast({
        title: "Success",
        description: "Medicine has been deleted.",
      });
      setDeleteDialogOpen(false);
      setMedicineToDelete(null);
      loadMedicines();
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast({
        title: "Error",
        description: "Failed to delete medicine. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If not admin or still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl">Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage medicines in the database
          </p>
        </div>

        <div className="grid gap-8 mb-8">
          <UserAdminManager />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Medicines</CardTitle>
              <Button onClick={() => openEditDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Medicine
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">
                          {medicine.name}
                        </TableCell>
                        <TableCell>{medicine.category}</TableCell>
                        <TableCell>₹{medicine.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(medicine)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMedicineToDelete(medicine.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Medicine Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Medicine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Medicine description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{
                    required: "Price is required",
                    min: {
                      value: 0.01,
                      message: "Price must be greater than 0",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Medicine category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="imageUrl"
                rules={{ required: "Image URL is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/medicines/example.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editingMedicine ? "Update" : "Add"} Medicine
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              medicine from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setMedicineToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
