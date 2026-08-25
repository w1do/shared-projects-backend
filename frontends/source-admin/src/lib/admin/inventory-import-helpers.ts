import * as XLSX from "xlsx";
import { z } from "zod";
import { toast } from "sonner";

export interface ParsedItem {
  id: string;
  fileName: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  incoming: number;
  threshold: number;
  location: string;
  isValid: boolean;
  errors: string[];
}

export const rowSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be positive")),
  stock: z.preprocess(
    (val) => (val === undefined || val === "" ? 0 : Number(val)),
    z.number().int().nonnegative("Stock cannot be negative"),
  ),
  incoming: z.preprocess(
    (val) => (val === undefined || val === "" ? 0 : Number(val)),
    z.number().int().nonnegative("Incoming cannot be negative"),
  ),
  threshold: z.preprocess(
    (val) => (val === undefined || val === "" ? 10 : Number(val)),
    z.number().int().nonnegative("Threshold cannot be negative"),
  ),
  location: z.string().optional().default("Main warehouse"),
});

export async function parseExcelFiles(files: File[]): Promise<ParsedItem[]> {
  const allParsedItems: ParsedItem[] = [];

  const parsePromises = files.map((file) => {
    return new Promise<ParsedItem[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

          if (rawData.length === 0) {
            resolve([]);
            return;
          }

          const headers = Object.keys(rawData[0]);
          const findColumn = (regex: RegExp) => headers.find((h) => regex.test(h));

          const nameCol = findColumn(/product\s*name|name|product|tên\s*sản\s*phẩm/i);
          const brandCol = findColumn(/brand|thương\s*hiệu/i);
          const categoryCol = findColumn(/category|danh\s*mục/i);
          const skuCol = findColumn(/sku|mã\s*sản\s*phẩm/i);
          const priceCol = findColumn(/price|giá/i);
          const stockCol = findColumn(/stock|quantity|qty|số\s*lượng/i);
          const incomingCol = findColumn(/incoming|sắp\s*về/i);
          const thresholdCol = findColumn(/threshold|định\s*mức/i);
          const locationCol = findColumn(/location|kho|vị\s*trí/i);

          if (!nameCol || !skuCol || !priceCol) {
            throw new Error(
              `File "${file.name}" is missing required columns. Ensure it has columns for Product Name, SKU, and Price.`,
            );
          }

          const parsed: ParsedItem[] = rawData.map((row, index) => {
            const getRowString = (col?: string) => {
              if (!col) return "";
              const val = row[col];
              return val !== undefined && val !== null ? String(val).trim() : "";
            };

            const itemData = {
              name: getRowString(nameCol),
              brand: brandCol ? getRowString(brandCol) : "Unknown Brand",
              category: categoryCol ? getRowString(categoryCol) : "Skincare",
              sku: getRowString(skuCol),
              price: priceCol ? row[priceCol] : undefined,
              stock: stockCol ? row[stockCol] : 0,
              incoming: incomingCol ? row[incomingCol] : 0,
              threshold: thresholdCol ? row[thresholdCol] : 10,
              location: locationCol ? getRowString(locationCol) : "Main warehouse",
            };

            const result = rowSchema.safeParse(itemData);

            return {
              id: `row-${index}-${file.name}-${Date.now()}`,
              fileName: file.name,
              name: itemData.name,
              brand: itemData.brand || "Unknown Brand",
              category: itemData.category || "Skincare",
              sku: itemData.sku,
              price: result.success ? result.data.price : Number(itemData.price) || 0,
              stock: result.success ? result.data.stock : Number(itemData.stock) || 0,
              incoming: result.success ? result.data.incoming : Number(itemData.incoming) || 0,
              threshold: result.success ? result.data.threshold : Number(itemData.threshold) || 10,
              location: itemData.location || "Main warehouse",
              isValid: result.success,
              errors: result.success
                ? []
                : result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
            };
          });

          resolve(parsed);
        } catch (err: unknown) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  });

  const results = await Promise.all(parsePromises);
  results.forEach((items) => allParsedItems.push(...items));
  return allParsedItems;
}

export function downloadSampleTemplate() {
  try {
    const wsData = [
      [
        "Product Name",
        "Brand",
        "Category",
        "SKU",
        "Price",
        "Stock",
        "Incoming",
        "Threshold",
        "Location",
      ],
      [
        "Rose Dew Facial Mist",
        "Aetheria",
        "Skincare",
        "ATH-ROSE-MIST",
        24.0,
        150,
        50,
        15,
        "Main warehouse",
      ],
      [
        "Jasmine Hydrating Cream",
        "Aetheria",
        "Skincare",
        "ATH-JASM-CREAM",
        48.0,
        80,
        20,
        10,
        "Main warehouse",
      ],
      [
        "Velvet Clay Mask",
        "Lumina",
        "Bodycare",
        "LMN-VELV-MASK",
        32.5,
        0,
        100,
        5,
        "Secondary warehouse",
      ],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
    XLSX.writeFile(wb, "import_inventory_template.xlsx");
    toast.success("Sample template downloaded successfully!");
  } catch (err) {
    toast.error("Could not download sample template.");
  }
}
