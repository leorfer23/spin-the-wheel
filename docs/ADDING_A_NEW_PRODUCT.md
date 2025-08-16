## Adding a new Product (Game)

This guide explains how to add a new product (game) to the modular dashboard so it plugs into the same layout, tabs, and configuration flow as existing products (e.g., Wheel, Jackpot).

Use the completed Jackpot scaffold as a reference implementation.

### 1) Declare the product type

Add your new product enum entry to `src/types/product.ts`:

```ts
export type ProductType =
  | "wheel"
  | "jackpot"
  | "lottery" // example new product
  | "scratch-card"
  | "slot-machine";
```

### 2) Add product metadata to the catalog

Register your product in the catalog so it appears in the left `ProductSelector` rail. Edit `src/products/registry.ts`:

```ts
export const PRODUCT_CATALOG: ProductMeta[] = [
  // ...existing
  {
    id: "lottery",
    name: "Sorteo de la Suerte",
    description: "Elige tus números",
    icon: "🎰",
    available: true, // set to true to make it clickable
  },
];
```

### 3) Create your product service (data layer)

Mirror an existing service (see `src/services/wheelService.ts` or the temporary in-memory `src/services/jackpotService.ts`). The service should expose CRUD-like methods:

- getProducts(storeId)
- getProduct(productId)
- createProduct(storeId, data)
- updateProduct(productId, updates)
- deleteProduct(productId)

Backed by Supabase in production. For fast prototyping you can start with a simple in-memory service (see Jackpot) and later replace it with a Supabase-backed implementation.

### 4) Create a Zustand store for the product

Create `src/stores/<product>Store.ts` similar to `src/stores/jackpotStore.ts` or `src/stores/wheelStore.ts`.

Required store responsibilities:

- Hold list and selected item: `items`, `selectedItemId`, `selectedItem`
- Load for a store: `load<Products>(storeId)`
- Select item: `select<Product>(id)`
- Create item: `create<Product>(storeId, name)`
- Update config slices exposed to the UI tabs:
  - Segments/symbols model (or equivalent core config)
  - Widget (handle, capture)
  - Schedule
  - Appearance (if applicable)
- UI state: `activeConfigSection`, `has<Product>Selected`, `isLoading`

Use the Wheel or Jackpot store as a template for naming and shape.

### 5) Build the product configuration UI

Create a configuration component under `src/components/dashboard/products/<product>/` that matches the layout and tabs, e.g.:

- `src/components/dashboard/products/<product>/<Product>Configuration.tsx`
- `src/components/dashboard/products/<product>/<product>ConfigConstants.ts` (tabs array)
- Sections reused from Wheel where possible:
  - Handle: `../wheel/sections/HandleSection`
  - Capture: `../wheel/sections/CaptureSection`
  - Schedule: `../wheel/sections/ScheduleSection`
  - Embed: `../wheel/sections/EmbedSection`
- Product-specific sections (e.g., Jackpot’s `SegmentsSection` for 3-reel symbol weights) live in `sections/`.

Aim to keep props consistent with Wheel where reasonable: pass current config and an `onUpdate...` callback per section.

### 6) Add a simple product selector/preview (left side)

Optional but recommended: a small component to select/create items and render a preview, similar to `WheelProduct` or `JackpotProduct`.

- Selector: drop-down with current items + “Create” input/button
- Preview: can be a placeholder until the actual game preview/animation is ready

### 7) Register the product adapter

Wire your product into the central registry so the right panel knows how to render configuration for the selected product.

Edit `src/products/registry.ts`:

```ts
import { use<YourProduct>Store } from "@/stores/<product>Store";
import { <Product>Configuration } from "@/components/dashboard/products/<product>/<Product>Configuration";

export const PRODUCT_REGISTRY: ProductRegistry = {
  // ...existing
  <product>: {
    id: "<product>",
    ConfigComponent: <Product>Configuration,
    useConfigProps: () => {
      const {
        selected<Product>,
        update<CoreSlice>,
        updateWidgetConfig,
        updateSchedule,
      } = use<YourProduct>Store();

      const data = selected<Product> || { id: "", /* defaults */ };
      return {
        // Map store state to configuration props
        <product>Id: data.id,
        // Core config slice
        <coreProp>: data.<coreProp>,
        onUpdate<CoreSlice>: update<CoreSlice>,
        // Shared slices
        widgetConfig: data.widgetConfig,
        onUpdateWidgetConfig: updateWidgetConfig,
        scheduleConfig: data.schedule,
        onUpdateScheduleConfig: updateSchedule,
      };
    },
    useCanRenderConfig: () => {
      const { has<Product>Selected } = use<YourProduct>Store();
      return has<Product>Selected;
    },
  },
};
```

This adapter is the central contract: it maps store state/actions into the props your `ConfigComponent` expects.

### 8) Dashboard wiring

The right panel already uses `ProductConfigurationPanel`, which consults the registry and renders your product’s config automatically. No changes needed once your adapter is registered.

For the left side preview, update `src/pages/dashboard/ModularDashboard.tsx` to render your product’s left view (or a placeholder) in the switch for the selected product.

### 9) Defaults

Keep defaults in `src/config/<product>Defaults.ts` so new items can be created instantly with meaningful settings.

### 10) Database & migrations (when going beyond prototype)

When moving off the in-memory service, add Supabase migrations mirroring `wheels` and related tables. Include:

- Main `<product>` table with `tiendanube_store_id`, `is_active`, and config JSON columns for each config slice (segments/symbols, widget, schedule, style).
- RLS policies and service role permissions similar to the existing migrations in `supabase/migrations/`.

Update your service to use the new schema and keep the adapter/store API stable.

### 11) Testing checklist

- Product appears in `ProductSelector` and is clickable
- Can create/select items in the left panel
- Right panel tabs render and update state via store actions
- Defaults load on create
- Type-check and lint pass

### Reference implementation

Use Jackpot as a working example for a new product:

- Types: `src/components/dashboard/products/jackpot/types.ts`
- Defaults: `src/config/jackpotDefaults.ts`
- Service: `src/services/jackpotService.ts` (in-memory)
- Store: `src/stores/jackpotStore.ts`
- Config UI: `src/components/dashboard/products/jackpot/JackpotConfiguration.tsx`
- Tabs: `src/components/dashboard/products/jackpot/jackpotConfigConstants.ts`
- Selector/preview: `src/components/dashboard/products/jackpot/JackpotProduct.tsx`
- Registry adapter: `src/products/registry.ts`
