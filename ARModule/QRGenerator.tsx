import React from "react";
import QRCode from "qrcode.react";

interface QRProps {
  productId?: string;
  wishlist?: string[];
}

const QRGenerator: React.FC<QRProps> = ({ productId, wishlist }) => {

  let url = "";

  if (productId) {
    url = `${window.location.origin}/?target=ar&id=${productId}`;
  }

  if (wishlist && wishlist.length > 0) {
    url = `${window.location.origin}/?target=ar&id=${wishlist.join(",")}`;
  }

  return (
    <div style={{ textAlign: "center" }}>

      <h3>Scan to open AR</h3>

      <QRCode
        value={url}
        size={180}
      />

      <p style={{ marginTop: "10px", fontSize: "12px" }}>
        Scan this QR with your phone camera
      </p>

    </div>
  );
};

export default QRGenerator;