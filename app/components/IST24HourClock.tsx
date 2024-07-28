"use client";

import React, { useState, useEffect } from "react";

const IST24HourClock = () => {
  const [dateTime, setDateTime] = useState<any>(null);

  useEffect(() => {
    setDateTime(new Date());
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDateTime = (date: any) => {
    if (!date) return "";
    const options = {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleString("en-US", options);
  };

  if (!dateTime) return <div>Loading...</div>;

  const [datePart, timePart] = formatDateTime(dateTime).split(" at ");

  return (
    <div className="ist-clock text-s7-gray200 mt-2">
      <p className="text-xs font-bold">{datePart}</p>
      <p className="text-xs font-bold">{timePart} IST</p>
    </div>
  );
};

export default IST24HourClock;
