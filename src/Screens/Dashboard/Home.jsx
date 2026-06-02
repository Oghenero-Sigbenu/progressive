"use client";

import React, { useState, useEffect } from "react";
import Card from "../../Components/Common/Card";
import { IoHome, IoPeople } from "react-icons/io5";
import DashboardLayout from "../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../Components/Dashboard/Title";
import Loader from "../../Components/Loader";
import {
  fetchAllDeaneries,
  fetchAllPaidParish,
  fetchAllParish,
  getAllAydDelegates,
} from "../../Redux/Api";
import { safeFetchList, safeFetchPaginated } from "../../helpers/api";

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Counts come from the `total` of paginated endpoints (not array length,
  // which is capped by page size). Paid parishes is an unpaginated list.
  const [delegateCount, setDelegateCount] = useState(0);
  const [parishCount, setParishCount] = useState(0);
  const [paidParish, setPaidParishes] = useState([]);
  const [deaneryCount, setDeaneryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadError(null);

    const [delegatesRes, parishesRes, paidParishesRes, deaneriesRes] =
      await Promise.all([
        // No aydId → backend returns delegates across all AYDs, so the
        // card reflects the true total registered count (axios omits the
        // undefined aydId param).
        safeFetchPaginated(getAllAydDelegates, undefined, {
          page: 1,
          limit: 1,
        }),
        safeFetchPaginated(fetchAllParish, { page: 1, limit: 1 }),
        safeFetchList(fetchAllPaidParish),
        safeFetchPaginated(fetchAllDeaneries, { page: 1, limit: 1 }),
      ]);

    setDelegateCount(delegatesRes.total);
    setParishCount(parishesRes.total);
    setPaidParishes(paidParishesRes.items);
    setDeaneryCount(deaneriesRes.total);

    const errors = [
      delegatesRes.error,
      parishesRes.error,
      paidParishesRes.error,
      deaneriesRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setLoadError(errors.join(" "));
      console.error("Dashboard load error:", errors.join(" "));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] ">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"Home Page"}
        />
        <div className="bg-transparent">
          {loadError && (
            <div className="w-[96%] mx-auto mt-[1rem] text-sm text-red-600">
              {loadError}{" "}
              <button type="button" onClick={loadDashboardData} className="underline">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center my-[4rem]">
              <Loader big />
            </div>
          ) : (
            <div className="flex gap-3 items-center h-full mx-auto mt-[2rem] flex-wrap w-[96%]">
              <Card
                text={deaneryCount}
                title={"Deaneries"}
                icon={<IoHome className="w-[2rem] h-[2rem] text-green" />}
              />
              <Card
                text={parishCount}
                title={" Parish Created"}
                icon={<IoHome className="w-[2rem] h-[2rem] text-green" />}
              />
              <Card
                text={delegateCount}
                title={"Registered Delegates"}
                icon={<IoPeople className="w-[2rem] h-[2rem] text-green" />}
              />
              <Card
                text={paidParish?.length}
                title={"Paid Parishes"}
                icon={<IoPeople className="w-[2rem] h-[2rem] text-green" />}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
