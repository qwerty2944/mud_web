export { supabase } from "./supabase";

// 게임 데이터 API
export {
  getEyeMappings,
  getHairMappings,
  getFacehairMappings,
  getBodyMappings,
  getAllMappings,
  clearMappingCache,
  type EyeMapping,
  type HairMapping,
  type FacehairMapping,
  type BodyMapping,
} from "./gameData";
