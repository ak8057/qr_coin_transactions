import React, { useEffect, useRef, useState, useContext } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Scan() {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("");
  const codeReaderRef = useRef(null);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          codeReader.reset();
          handleScanned(result.getText());
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg("Camera permission required or no camera.");
      });

    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
    };
  }, [isLoggedIn, navigate]);

  async function handleScanned(qrText) {
    setMsg("Verifying QR...");
    try {
      const r = await API.post("/scan", { qrText });
      setMsg(
        `Success: +${r.data.coinsCredited} coins. New balance: ${r.data.newBalance}`
      );
    } catch (err) {
      setMsg("Scan error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg text-center">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
          <span className="text-blue-600">📷</span> Scan QR
        </h2>

        {/* Camera Frame */}
        <div className="relative border-4 border-dashed border-blue-400 rounded-xl overflow-hidden">
          <video ref={videoRef} className="w-full max-h-72 object-cover" />

          {/* Overlay effect */}
          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg pointer-events-none animate-pulse" />
        </div>

        {/* Status / Message */}
        <p
          className={`mt-6 text-lg font-medium ${
            msg.includes("Success")
              ? "text-green-600"
              : msg.includes("error")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {msg || "Align the QR code within the frame"}
        </p>
      </div>
    </div>
  );

}
