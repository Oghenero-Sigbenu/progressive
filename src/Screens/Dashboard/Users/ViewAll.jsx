"use client";

import React, { useEffect, useState } from "react";
import ExportButton from "../../../Components/Common/ExportButton";
import Pagination from "../../../Components/Common/Pagination";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { fetchUsers } from "../../../Redux/Api";
import { safeFetchPaginated } from "@/src/helpers/api";

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchUsersList = async (page = 1, search = "", limit = pageSize) => {
    setLoading(true);
    setLoadError(null);
    const { items, pages, total, page: resPage, error } =
      await safeFetchPaginated(fetchUsers, { page, limit, search });
    if (error) {
      setLoadError(error);
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
      console.error("Error fetching users:", error);
    } else {
      setUsers(items);
      setTotalPages(pages);
      setTotalItems(total);
      setCurrentPage(resPage || page);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersList(1, "", pageSize);
    // eslint-disable-next-line
  }, []);

  const onInputChange = (search) => {
    setSearchTerm(search);
    fetchUsersList(1, search, pageSize);
  };

  const handlePageChange = (page) => fetchUsersList(page, searchTerm, pageSize);
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    fetchUsersList(1, searchTerm, size);
  };

  const exportRows = users.map((u) => ({
    firstName: u?.firstName,
    lastName: u?.lastName,
    email: u?.email,
    phoneNumber: u?.phoneNumber,
    role: u?.Role?.name,
    deanery: u?.Deanery?.name,
    parish: u?.Parish?.name,
  }));

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"View Users"}
        />
      </div>
      <div className="flex justify-end w-[90%] mx-auto mt-[1rem]">
        <ExportButton data={exportRows} fileName={"CYON Users"} />
      </div>
      <div className="w-full">
        {loadError && (
          <div className="w-[80%] mx-auto mt-4 text-center text-sm text-red-600">
            {loadError}{" "}
            <button
              type="button"
              onClick={() => fetchUsersList(currentPage, searchTerm, pageSize)}
              className="underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex my-4 rounded-[5px] bg-primary mx-auto items-center w-[80%] md:w-[400px]">
          <input
            placeholder="Search name or email"
            value={searchTerm}
            onChange={(e) => onInputChange(e.target.value)}
            className="py-[.5rem] rounded-tl-[5px] rounded-bl-[5px] w-[80%] px-[1rem] outline-none border-none "
          />
          <p className="px-[.5rem] text-white">Search</p>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center my-[3rem] text-primary">
            {searchTerm ? "No users match your search." : "No users available."}
          </p>
        ) : (
          <>
            <div className="w-[96%] mx-auto overflow-x-auto">
              <table className="w-full min-w-[720px] border mb-[1rem]">
                <thead>
                  <tr className="border-b text-xs sm:text-sm md:text-base">
                    <th className="py-[.5rem] w-[60px]">S/N</th>
                    <th className="py-[.5rem]">First Name</th>
                    <th className="py-[.5rem]">Last Name</th>
                    <th className="py-[.5rem]">Email</th>
                    <th className="py-[.5rem]">Phone</th>
                    <th className="py-[.5rem]">Role</th>
                    <th className="py-[.5rem]">Deanery</th>
                    <th className="py-[.5rem]">Parish</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item, index) => (
                    <tr
                      className="text-center text-xs sm:text-sm md:text-base"
                      key={item?.id || index}
                    >
                      <td className="border py-[.5rem]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.firstName}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.lastName}
                      </td>
                      <td className="border py-[.5rem] px-2">{item?.email}</td>
                      <td className="border py-[.5rem] px-2">
                        {item?.phoneNumber || "-"}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.Role?.name || "-"}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.Deanery?.name || "-"}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.Parish?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={loading}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewUsers;
