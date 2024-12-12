import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RiAddLargeLine } from "react-icons/ri";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaSortUp, FaSortDown } from "react-icons/fa";

const App = ({ product = [] }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    nama_barang: "",
    stok: "",
    jumlah_terjual: "",
    tanggal_transaksi: "",
    jenis_barang: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: "nama_barang",
    direction: "ascending",
  });

  // Show Data
  const fetchData = async () => {
    console.log("Fetching from:", `${BASE_URL}/product`);
    try {
      const response = await axios.get(`${BASE_URL}/product`);
      console.log("Response data:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit data
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (
      !formData.nama_barang ||
      !formData.stok ||
      !formData.jumlah_terjual ||
      !formData.tanggal_transaksi ||
      !formData.jenis_barang
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      nama_barang: formData.nama_barang,
      stok: parseInt(formData.stok),
      jumlah_terjual: parseInt(formData.jumlah_terjual),
      tanggal_transaksi: formData.tanggal_transaksi,
      jenis_barang: formData.jenis_barang,
    };

    console.log("Submitting payload:", payload);

    if (editingId) {
      try {
        const response = await axios.patch(
          `${BASE_URL}/product/${editingId}`,
          payload
        );
        console.log("Update response:", response);
        setEditingId(null);
        alert("Update Data Succesfully.");
        closeModal();
      } catch (error) {
        if (error.response) {
          console.error("Error updating product:", error.response.data);
          alert(
            `Error: ${
              error.response.data.message || "Failed to delete product."
            }`
          );
        } else {
          console.error("Error updating product:", error.message);
          alert("An unexpected error occurred. Please try again later.");
        }
      }
    } else {
      try {
        const response = await axios.post(`${BASE_URL}/product`, payload);
        console.log("Create response:", response);
        alert("Add Data Succesfully.");
      } catch (error) {
        if (error.response) {
          console.error("Error creating product:", error.response.data);
          alert(
            `Error: ${
              error.response.data.message || "Failed to delete product."
            }`
          );
        } else {
          console.error("Error creating product:", error.message);
          alert("An unexpected error occurred. Please try again later.");
        }
      }
      closeModal();
    }

    setFormData({
      nama_barang: "",
      stok: "",
      jumlah_terjual: "",
      tanggal_transaksi: "",
      jenis_barang: "",
    });

    fetchData();
  };

  // Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Edit data
  const handleEdit = (product) => {
    setFormData({
      nama_barang: product.nama_barang,
      stok: product.stok,
      jumlah_terjual: product.jumlah_terjual,
      tanggal_transaksi: product.tanggal_transaksi,
      jenis_barang: product.jenis_barang,
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  // Delete data
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/product/${id}`);
      fetchData();
      alert("Add Data Succesfully.");
    } catch (error) {
      if (error.response) {
        console.error("Error deleting product:", error.response.data);
        alert(
          `Error: ${error.response.data.message || "Failed to delete product."}`
        );
      } else {
        console.error("Error deleting product:", error.message);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  // Modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtered Data
  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(searchLower) ||
      item.stok.toString().includes(searchLower) ||
      item.jumlah_terjual.toString().includes(searchLower) ||
      item.tanggal_transaksi.toLowerCase().includes(searchLower) ||
      item.jenis_barang.toLowerCase().includes(searchLower)
    );
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ganti halaman
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="m-2">
        <h1 className="text-3xl text-center font-bold mb-2">Tokoku</h1>
        <p className="font-normal text-gray-700 dark:text-gray-400 text-center">
          Welcome to Tokoku
        </p>
        <div className="block mb-2 mx-auto border-b border-slate-300 pb-2 max-w-[360px]">
          <p></p>
        </div>

        <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
            <div className="flex items-center justify-between gap-8 mb-8">
              <div>
                <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                  Product list
                </h5>
                <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
                  See information about all product
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                <button
                  className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                  data-dialog-target="dialog"
                  onClick={openModal}
                >
                  <RiAddLargeLine />
                  Add Product
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="block w-full overflow-hidden md:w-max">
                <nav>
                  <ul
                    role="tablist"
                    className="relative flex flex-row p-1 rounded-lg bg-blue-gray-50 bg-opacity-60"
                  >
                    <li
                      role="tab"
                      className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none text-blue-gray-900"
                      data-value="all"
                    >
                      <div className="z-20 mx-2 w-10 text-inherit">All</div>
                      <div className="absolute inset-0 z-10 h-full bg-white rounded-md shadow"></div>
                    </li>
                    <li
                      role="tab"
                      className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none text-blue-gray-900"
                      data-value="monitored"
                    >
                      <div className="z-20 mx-2 text-inherit">Monitored</div>
                    </li>
                    <li
                      role="tab"
                      className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none text-blue-gray-900"
                      data-value="unmonitored"
                    >
                      <div className="z-20 mx-2 text-inherit">Unmonitored</div>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="w-full md:w-72">
                <div className="relative h-10 w-full min-w-[200px]">
                  <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                    placeholder=" "
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                    Search
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 px-0 overflow-scroll mt-4">
            <table className="w-full text-left table-auto min-w-max">
              <thead className="bg-slate-50 border-slate-200">
                <tr>
                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      No
                    </p>
                  </th>
                  <th
                    onClick={() => requestSort("nama_barang")}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50 cursor-pointer"
                  >
                    <p className="flex font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Nama Barang
                      <div className="ml-2">
                        {sortConfig.key === "nama_barang" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </p>
                  </th>
                  <th
                    onClick={() => requestSort("stok")}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50 cursor-pointer"
                  >
                    <p className="flex font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Stok
                      <div className="ml-2">
                        {sortConfig.key === "stok" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </p>
                  </th>
                  <th
                    onClick={() => requestSort("jumlah_terjual")}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50 cursor-pointer"
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      <div className="ml-2">
                        {sortConfig.key === "jumlah_terjual" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                      Jumlah Terjual
                    </p>
                  </th>
                  <th
                    onClick={() => requestSort("tanggal_transaksi")}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50 cursor-pointer"
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      <div className="ml-2">
                        {sortConfig.key === "tanggal_transaksi" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                      Tanggal Transaksi
                    </p>
                  </th>
                  <th
                    onClick={() => requestSort("jenis_barang")}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50 cursor-pointer"
                  >
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Jenis Barang
                      <div className="ml-2">
                        {sortConfig.key === "jenis_barang" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </p>
                  </th>
                  <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                    <p className="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                      Action
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems && currentItems.length > 0 ? (
                  Array.isArray(product) &&
                  currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="p-4 border-b border-blue-gray-50">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {index + 1}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {item.nama_barang}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="w-max">
                          <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-yellow-500/20">
                            <span className="">{item.stok}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="w-max">
                          <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
                            <span className="">{item.jumlah_terjual}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {item.tanggal_transaksi}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {item.jenis_barang}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <button
                          className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                          type="button"
                          data-dialog-target="dialog"
                          onClick={() => handleEdit(item)}
                        >
                          <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                            <MdEdit className="text-lg" />
                          </span>
                        </button>
                        <button
                          className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                          type="button"
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              "Are you sure you want to delete this item?"
                            );
                            if (confirmDelete) {
                              handleDelete(item.id);
                            }
                          }}
                        >
                          <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                            <MdDelete className="text-lg" />
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4 py-5">
                      <p className="text-sm text-slate-500">
                        No items in Product.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <div className="text-sm text-slate-500">
              Showing{" "}
              <b>
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
              </b>{" "}
              of {totalItems}
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              {/* <div className="text-sm text-slate-500">
                Showing{" "}
                <b>
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
                </b>{" "}
                of {totalItems}
              </div> */}
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal ${
                      currentPage === index + 1
                        ? "text-white bg-slate-800"
                        : "text-slate-500 bg-white"
                    } border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          data-dialog-backdrop="dialog"
          data-dialog-backdrop-close="true"
          className="absolute left-0 top-0 inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
        >
          <div
            data-dialog="dialog"
            className="relative mx-auto flex w-full max-w-[24rem] flex-col rounded-xl bg-white bg-clip-border text-slate-700 shadow-md"
          >
            <form onSubmit={handleFormSubmit}>
              <div className="flex flex-col p-6">
                <h4 className="text-2xl mb-1 font-semibold text-slate-700">
                  {editingId ? "Update" : "Add"} Product
                </h4>

                <div className="w-full max-w-sm min-w-[200px] mt-4">
                  <label className="block mb-1 text-sm text-slate-700 text-start">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    name="nama_barang"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    placeholder="Enter your text"
                    value={formData.nama_barang}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full max-w-sm min-w-[200px] mt-4">
                  <label className="block mb-1 text-sm text-slate-700 text-start">
                    Stok
                  </label>
                  <input
                    type="number"
                    name="stok"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    placeholder="Enter your number"
                    value={formData.stok}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full max-w-sm min-w-[200px] mt-4">
                  <label className="block mb-1 text-sm text-slate-700 text-start">
                    Jumlah Terjual
                  </label>
                  <input
                    type="number"
                    name="jumlah_terjual"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    placeholder="Enter your number"
                    value={formData.jumlah_terjual}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full max-w-sm min-w-[200px] mt-4">
                  <label className="block mb-1 text-sm text-slate-700 text-start">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    name="tanggal_transaksi"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    value={formData.tanggal_transaksi}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full max-w-sm min-w-[200px] mt-4">
                  <label className="block mb-1 text-sm text-slate-700 text-start">
                    Jenis Barang
                  </label>
                  <input
                    type="text"
                    name="jenis_barang"
                    className="w-full h-10 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    placeholder="Enter your text"
                    value={formData.jenis_barang}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex space-x-2">
                  <button
                    className="w-full mx-auto select-none rounded border border-red-600 py-2 px-4 text-center text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-600/20 active:bg-red-700 active:text-white active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    data-dialog-close="true"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    className="w-full mx-auto select-none rounded bg-slate-800 py-2 px-4 text-center text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="submit"
                    data-dialog-close="true"
                  >
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Validasi properti (prop types)
App.propTypes = {
  product: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nama_barang: PropTypes.string,
    })
  ),
};

export default App;
