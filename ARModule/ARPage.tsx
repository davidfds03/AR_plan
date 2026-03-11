import React, { useEffect, useState } from "react";
import ARScene from "./ARScene";
import "./ar.css";
import productsData from "../real_compare/real_compare/planpro_data_2.json";

const PRODUCTS:any = productsData;
interface ARPageProps {
  productId?: string;
}


const ARPage: React.FC<ARPageProps> = ({ productId }) => {

  const [modelPath, setModelPath] = useState("");

  useEffect(() => {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {

    const product = PRODUCTS.find((p:any)=>p.ID === id);

    if (product) {

      const modelPath = `/models/${product.ModelURL.replace("products/", "")}`;

      console.log("Loading model:", modelPath);

      setModelPath(modelPath);
    }

  }

}, []);
  return (
    <ARScene model={modelPath} />
  );
};

export default ARPage;