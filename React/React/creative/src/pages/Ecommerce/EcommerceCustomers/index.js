import React, { useState, useEffect, useMemo, useCallback } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  Modal,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import { Link } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import { isEmpty } from "lodash";
import * as moment from "moment";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

//Import Breadcrumb
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";

import {
  getCustomers as onGetCustomers,
  addNewCustomer as onAddNewCustomer,
  updateCustomer as onUpdateCustomer,
  deleteCustomer as onDeleteCustomer,
} from "../../../store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import TableContainer from "../../../Components/Common/TableContainer";

// Export Modal
import ExportCSVModal from "../../../Components/Common/ExportCSVModal";

const EcommerceCustomers = () => {

  const dispatch = useDispatch();

  const { customers, isCustomerCreated, isCustomerSuccess, error } = useSelector((state) => ({
    customers: state.Ecommerce.customers,
    isCustomerCreated: state.Ecommerce.isCustomerCreated,
    isCustomerSuccess: state.Ecommerce.isCustomerSuccess,
    error: state.Ecommerce.error,
  }));

  const [isEdit, setIsEdit] = useState(false);
  const [customer, setCustomer] = useState([]);

  // Delete customer
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [modal, setModal] = useState(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCustomer(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const customermocalstatus = [
    {
      options: [
        { label: "Status", value: "Status" },
        { label: "Active", value: "Active" },
        { label: "Block", value: "Block" },
      ],
    },
  ];

  // Delete Data
  const onClickDelete = (customer) => {
    setCustomer(customer);
    setDeleteModal(true);
  };

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      customer: (customer && customer.customer) || '',
      email: (customer && customer.email) || '',
      phone: (customer && customer.phone) || '',
      date: (customer && customer.date) || '',
      status: (customer && customer.status) || '',
    },
    validationSchema: Yup.object({
      customer: Yup.string().required("Please Enter Customer Name"),
      email: Yup.string().required("Please Enter Your Email"),
      phone: Yup.string().required("Please Enter Your Phone"),
      status: Yup.string().required("Please Enter Your Status")
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updateCustomer = {
          _id: customer ? customer._id : 0,
          customer: values.customer,
          email: values.email,
          phone: values.phone,
          date: date,
          status: values.status,
        };
        // update customer
        dispatch(onUpdateCustomer(updateCustomer));
        validation.resetForm();
      } else {
        const newCustomer = {
          _id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
          customer: values["customer"],
          email: values["email"],
          phone: values["phone"],
          date: date,
          status: values["status"]
        };
        // save new customer
        dispatch(onAddNewCustomer(newCustomer));
        validation.resetForm();
      }
      toggle();
    },
  });

  // Delete Data
  const handleDeleteCustomer = () => {
    if (customer) {
      dispatch(onDeleteCustomer(customer._id));
      setDeleteModal(false);
    }
  };

  // Update Data
  const handleCustomerClick = useCallback((arg) => {
    const customer = arg;

    setCustomer({
      _id: customer._id,
      customer: customer.customer,
      email: customer.email,
      phone: customer.phone,
      date: customer.date,
      status: customer.status
    });

    setIsEdit(true);
    toggle();
  }, [toggle]);


  useEffect(() => {
    if (customers && !customers.length) {
      dispatch(onGetCustomers());
    }
  }, [dispatch, customers]);


  useEffect(() => {
    setCustomer(customers);
  }, [customers]);

  useEffect(() => {
    if (!isEmpty(customers)) {
      setCustomer(customers);
      setIsEdit(false);
    }
  }, [customers]);

  // Add Data
  const handleCustomerClicks = () => {
    setCustomer("");
    setIsEdit(false);
    toggle();
  };

  // Node API 
  // useEffect(() => {
  //   if (isCustomerCreated) {
  //     setCustomer(null);
  //     dispatch(onGetCustomers());
  //   }
  // }, [
  //   dispatch,
  //   isCustomerCreated,
  // ]);

  const handleValidDate = date => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  // Checked All
  const checkedAll = () => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".customerCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
  };

  // Delete Multiple
  const deleteMultiple = () => {
    const ele = document.querySelectorAll(".customerCheckBox:checked");
    const checkall = document.getElementById("checkBoxAll");
    ele.forEach((element) => {
      dispatch(onDeleteCustomer(element.value));
    });
    checkall.checked = false;
  };

  // Customers Column
  const columns = useMemo(
    () => [
      {
        Header: <input type="checkbox" className="form-check-input" id="checkBoxAll" onClick={() => checkedAll()} />,
        Cell: (cellProps) => {
          return <input type="checkbox" className="customerCheckBox form-check-input" value={cellProps.row.original._id} />;
        },
        id: '#',
      },
      {
        Header: '',
        accessor: 'id',
        hiddenColumns: true,
        Cell: (cell) => {
          return <input type="hidden" value={cell.value} />;
        }
      },
      {
        Header: "Customer",
        accessor: "customer",
        filterable: true,
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: true,
      },
      {
        Header: "Phone",
        accessor: "phone",
        filterable: true,
      },
      {
        Header: "Date",
        accessor: "date",
        filterable: true,
        Cell: (cell) => (
          <>
            {handleValidDate(cell.value)}
          </>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: (cell) => {
          switch (cell.value) {
            case "Active":
              return <span className="badge text-uppercase badge-soft-success"> {cell.value} </span>;
            case "Block":
              return <span className="badge text-uppercase badge-soft-danger"> {cell.value} </span>;
            default:
              return <span className="badge text-uppercase badge-soft-info"> {cell.value} </span>;
          }
        }
      },
      {
        Header: "Action",
        Cell: (cellProps) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit" title="Edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => { const customerData = cellProps.row.original; handleCustomerClick(customerData); }}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item" title="Remove">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => { const customerData = cellProps.row.original; onClickDelete(customerData); }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    [handleCustomerClick]
  );

  const dateFormat = () => {
    let d = new Date(),
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return ((d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear()).toString());
  };

  const [date, setDate] = useState(dateFormat());

  const dateformate = (e) => {
    const date = e.toString().split(" ");
    const joinDate = (date[2] + " " + date[1] + ", " + date[3]).toString();
    setDate(joinDate);
  };

  // Export Modal
  const [isExportCSV, setIsExportCSV] = useState(false);

  document.title = "Customers | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <ExportCSVModal
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          data={customers}
        />
        <DeleteModal
          show={deleteModal}
          onDeleteClick={() => {
            handleDeleteCustomer();
          }}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <BreadCrumb title="Customers" pageTitle="Ecommerce" />
          <Row>
            <Col lg={12}>
              <Card id="customerList">
                <CardHeader className="border-0">
                  <Row className="g-4 align-items-center">
                    <div className="col-sm">
                      <div>
                        <h5 className="card-title mb-0">Customer List</h5>
                      </div>
                    </div>
                    <div className="col-sm-auto">
                      <div>
                        <button className="btn btn-soft-danger me-1"
                          onClick={() => setDeleteModalMulti(true)}
                        ><i className="ri-delete-bin-2-line"></i></button>
                        <button
                          type="button"
                          className="btn btn-secondary add-btn"
                          id="create-btn"
                          onClick={() => { setIsEdit(false); toggle(); }}
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Add
                          Customer
                        </button>{" "}
                        <button type="button" className="btn btn-success" onClick={() => setIsExportCSV(true)}>
                          <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                          Export
                        </button>
                      </div>
                    </div>
                  </Row>
                </CardHeader>
                <div className="card-body pt-0">
                  <div>
                    {isCustomerSuccess && customers.length ? (
                      <TableContainer
                        columns={columns}
                        data={(customers || [])}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={10}
                        className="custom-header-css"
                        theadClass="table-light text-muted"
                        handleCustomerClick={handleCustomerClicks}
                        isCustomerFilter={true}
                      />
                    ) : (<Loader error={error} />)
                    }
                  </div>

                  <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                    <ModalHeader className="bg-light p-3" toggle={toggle}>
                      {!!isEdit ? "Edit Customer" : "Add Customer"}
                    </ModalHeader>
                    <Form onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}>
                      <ModalBody>
                        <input type="hidden" id="id-field" />

                        <div
                          className="mb-3"
                          id="modal-id"
                          style={{ display: "none" }}
                        >
                          <Label htmlFor="id-field1" className="form-label">
                            ID
                          </Label>
                          <Input
                            type="text"
                            id="id-field1"
                            className="form-control"
                            placeholder="ID"
                            readOnly
                          />
                        </div>

                        <div className="mb-3">
                          <Label
                            htmlFor="customername-field"
                            className="form-label"
                          >
                            Customer Name
                          </Label>
                          <Input
                            name="customer"
                            id="customername-field"
                            className="form-control"
                            placeholder="Enter Name"
                            type="text"
                            validate={{
                              required: { value: true },
                            }}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.customer || ""}
                            invalid={
                              validation.touched.customer && validation.errors.customer ? true : false
                            }
                          />
                          {validation.touched.customer && validation.errors.customer ? (
                            <FormFeedback type="invalid">{validation.errors.customer}</FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <Label htmlFor="email-field" className="form-label">
                            Email
                          </Label>
                          <Input
                            name="email"
                            type="email"
                            id="email-field"
                            placeholder="Enter Email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ""}
                            invalid={
                              validation.touched.email && validation.errors.email ? true : false
                            }
                          />
                          {validation.touched.email && validation.errors.email ? (
                            <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                          ) : null}

                        </div>

                        <div className="mb-3">
                          <Label htmlFor="phone-field" className="form-label">
                            Phone
                          </Label>
                          <Input
                            name="phone"
                            type="text"
                            id="phone-field"
                            placeholder="Enter Phone no."
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.phone || ""}
                            invalid={
                              validation.touched.phone && validation.errors.phone ? true : false
                            }
                          />
                          {validation.touched.phone && validation.errors.phone ? (
                            <FormFeedback type="invalid">{validation.errors.phone}</FormFeedback>
                          ) : null}

                        </div>

                        <div className="mb-3">
                          <Label htmlFor="date-field" className="form-label">
                            Joining Date
                          </Label>

                          <Flatpickr
                            name="date"
                            id="date-field"
                            className="form-control"
                            placeholder="Select a date"
                            options={{
                              altInput: true,
                              altFormat: "d M, Y",
                              dateFormat: "d M, Y",
                            }}
                            onChange={(e) =>
                              dateformate(e)
                            }
                            value={validation.values.date || ""}
                          />
                          {validation.touched.date && validation.errors.date ? (
                            <FormFeedback type="invalid">{validation.errors.date}</FormFeedback>
                          ) : null}
                        </div>

                        <div>
                          <Label htmlFor="status-field" className="form-label">
                            Status
                          </Label>

                          <Input
                            name="status"
                            type="select"
                            className="form-select"
                            id="status-field"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={
                              validation.values.status || ""
                            }
                          >
                            {customermocalstatus.map((item, key) => (
                              <React.Fragment key={key}>
                                {item.options.map((item, key) => (<option value={item.value} key={key}>{item.label}</option>))}
                              </React.Fragment>
                            ))}
                          </Input>
                          {validation.touched.status &&
                            validation.errors.status ? (
                            <FormFeedback type="invalid">
                              {validation.errors.status}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                          <button type="button" className="btn btn-light" onClick={() => { setModal(false); }}> Close </button>

                          <button type="submit" className="btn btn-success"> {!!isEdit ? "Update" : "Add Customer"} </button>
                        </div>
                      </ModalFooter>
                    </Form>
                  </Modal>
                  <ToastContainer closeButton={false} />
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceCustomers;