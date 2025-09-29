import fs from "fs";
import path from "path";
const profilesPath = path.join(process.cwd(), "data", "profiles.json");
export function loadProfiles() {
    if (!fs.existsSync(profilesPath)) {
        fs.writeFileSync(profilesPath, "[]", "utf-8");
    }
    const data = fs.readFileSync(profilesPath, "utf-8");
    return JSON.parse(data);
}
export function saveProfiles(profiles) {
    fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2), "utf-8");
}
//# sourceMappingURL=profilesUtils.js.map