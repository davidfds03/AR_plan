import React, { useEffect, useState, Suspense } from "react";
const ARScene = React.lazy(() => import("./ARScene"));
const MultiARScene = React.lazy(() => import("./MultiARScene"));
import "./ar.css";
import ErrorBoundary from "./ErrorBoundary";
import productsData from "../real_compare/real_compare/planpro_data_2.json";

const PRODUCTS: any = productsData;

interface ARPageProps {
  productId?: string;
}

const ARPage: React.FC<ARPageProps> = ({ productId }) => {

  const [modelPath, setModelPath] = useState("");
  const [models, setModels] = useState<string[] | null>(null);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");
    const items = params.get("items");

    // MULTI OBJECT MODE (wishlist QR)
    if (items) {
      const ids = items.split(",");

      const modelsArr = ids.map(id => {
        const p = PRODUCTS.find((x: any) => x.ID === id);
        if (!p) return null;
        return `/models/${p.ModelURL.replace("products/", "").replaceAll(" ", "%20")}`;
      }).filter(Boolean) as string[];

      if (modelsArr.length > 0) {
        console.log("Loading multi AR models:", modelsArr);
        setModels(modelsArr);
      } else {
        console.warn("No models found for items:", items);
      }

      return;
    }

    // SINGLE PRODUCT MODE (current system)
    if (id) {

      const product = PRODUCTS.find((p:any)=>p.ID === id);

      if (product) {

        const path = `/models/${product.ModelURL.replace("products/","")}`;

        console.log("Loading model:", path);

        setModelPath(path);
      }

    }

  }, []);

  // Ensure we only attempt to render AR components in the browser
  if (typeof window === "undefined") return null;

  if (models && models.length > 0) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading AR...</div>}>
        <MultiARScene models={models} />
      </Suspense>
    </ErrorBoundary>
  );
}

if (modelPath) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading AR...</div>}>
        <ARScene model={modelPath} />
      </Suspense>
    </ErrorBoundary>
  );
}

return <div>Loading AR...</div>;

};

export default ARPage;