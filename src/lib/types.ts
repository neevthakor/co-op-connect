export type GenericPrimitive = string | number | boolean | null | undefined;
export type GenericObject = { [key: string]: GenericPrimitive | GenericPrimitive[] | GenericObject | GenericObject[] };
