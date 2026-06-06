import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kupaxlhmfzoxvwuessyn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cGF4bGhtZnpveHZ3dWVzc3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDk3NTAsImV4cCI6MjA5NTY4NTc1MH0.FP2Sxr_AvQW1csN_wGHuLDux9aQ9fNm6xbbzhtM2TsQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);