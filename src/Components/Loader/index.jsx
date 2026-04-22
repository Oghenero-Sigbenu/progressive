"use client";

import React from "react";
import "./Loader.css";
function Loader({ big }) {
  return <div className={big ? "lds-dual-ring2" : "lds-dual-ring"} />;
}

export default Loader;
