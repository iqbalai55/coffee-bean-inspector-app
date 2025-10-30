// scripts/generate-manifest.ts
import fs from "fs";
import path from "path";

// Read JSON file directly
const iconPath = path.join(process.cwd(), "public", "icon.json");
const iconData = fs.readFileSync(iconPath, "utf-8");
const iconList = JSON.parse(iconData);

// Map icons to add "type"
const iconsWithType = iconList.icons.map((icon: any) => ({
  src: `/${icon.src}`,
  sizes: icon.sizes,
  type: "image/png"
}));

const manifest = {
  name: "AI Camera App",
  short_name: "AI Camera",
  description: "Detect objects instantly with AI.",
  start_url: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#3b82f6",
  icons: iconsWithType
};

const filePath = path.join(process.cwd(), "public", "manifest.json");
fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
console.log("manifest.json generated successfully!");
