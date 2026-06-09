import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { addLocation } from "@/features/store/geoJsonSlice";
import { toast } from "sonner";
import type { Feature, Point } from "geojson";

const LocationAdd = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const dispatch = useDispatch();

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Nom kiritish shart");
      return;
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error("Koordinatalar to'g'ri kiritilmagan");
      return;
    }

    const feature: Feature<Point> = {
      type: "Feature",
      geometry: {type: "Point", coordinates: [lngNum, latNum]},
      properties: {name: name.trim()},
    };

    dispatch(addLocation(feature));
    toast.success(`${name} qo'shildi`);
    setName("");
    setLat("");
    setLng("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 mt-1" size="sm">
          <Plus className="w-4 h-4" />
          Location qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi location qo'shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="loc-name">Nom</Label>
            <Input
              id="loc-name"
              placeholder="Shahar nomi..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="loc-lat">Kenglik (Lat)</Label>
              <Input
                id="loc-lat"
                placeholder="100.101"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                type="number"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc-lng">Uzunlik (Lng)</Label>
              <Input
                id="loc-lng"
                placeholder="-100.101"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                type="number"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Qo'shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationAdd;