"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import _img_AYDLogo from "../../Assests/AYD1.jpg";
import {
  isEmpty,
  isValidEmail,
  validatePhoneNumber,
} from "../../helpers/utils";
import { ContactOptions } from "../Ayd";
import SelectInput from "../Ayd/SelectInput";
import PersonalInfo from "../Ayd/PersonalInfo";
import Stepper from "../Ayd/Stepper";
import {
  fetchAllDeaneries,
  fetchAllPaidParishByDeanery,
  fetchActiveAyd,
} from "../../Redux/Api";
import { safeFetchList, extractOne, apiErrorMessage } from "../../helpers/api";
const AYDLogo =
  _img_AYDLogo && typeof _img_AYDLogo === "object" && "src" in _img_AYDLogo
    ? _img_AYDLogo.src
    : _img_AYDLogo;

const STEP_LABELS = ["Deanery", "Parish", "Personal", "Contact"];
const REGISTRATION_OPEN = true;

const AYDModal = () => {
  const initialState = {
    deaneryId: "",
    parishId: "",
    firstName: "",
    lastName: "",
    email: "",
    aydId: "216bceea-1b7e-44e9-8607-cc0dd74e1f30",
    position: "",
    phoneNumber: 0,
    gender: "",
  };

  const [parishes, setParishes] = useState([]);
  const [requestData, setRequestData] = useState(initialState);
  const [activeStep, setStep] = useState(REGISTRATION_OPEN ? 1 : 6);
  const [deaneries, setDeaneries] = useState([]);
  const [loadingDeaneries, setLoadingDeaneries] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [deaneryError, setDeaneryError] = useState(null);
  const [parishError, setParishError] = useState(null);
  const [aydError, setAydError] = useState(null);
  const { deaneryId, parishId } = requestData;
  const [isValid, setIsValid] = useState(true);
  const [isValidNumber, setIsValidNumber] = useState(true);

  const handleChange = (e) => {
    const { type, name, value, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setRequestData((prev) => {
      const nextState = { ...prev, [name]: val };
      if (name === "deaneryId") nextState.parishId = "";
      return nextState;
    });
    if (name === "email") setIsValid(isValidEmail(value));
    if (name === "phoneNumber")
      setIsValidNumber(validatePhoneNumber(String(value)));
  };

  const fetchDeaneries = async () => {
    setLoadingDeaneries(true);
    setDeaneryError(null);
    const { items, error } = await safeFetchList(fetchAllDeaneries);
    setDeaneries(items);
    setDeaneryError(error);
    setLoadingDeaneries(false);
  };

  const fetchParishes = async () => {
    setLoadingParishes(true);
    setParishError(null);
    const { items, error } = await safeFetchList(
      fetchAllPaidParishByDeanery,
      deaneryId,
    );
    console.log(items);
    setParishes(items);
    setParishError(error);
    setLoadingParishes(false);
  };

  const loadActiveAyd = async () => {
    setAydError(null);
    try {
      const res = await fetchActiveAyd();
      const ayd = extractOne(res);
      if (ayd?.id) {
        setRequestData((prev) => ({ ...prev, aydId: ayd.id }));
      } else {
        setAydError("No active AYD event right now.");
      }
    } catch (err) {
      const msg =
        err?.response?.status === 404
          ? "No active AYD event right now."
          : apiErrorMessage(err, "Could not load AYD event");
      setAydError(msg);
    }
  };

  const next = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);
  const handleKeyPress = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  useEffect(() => {
    fetchDeaneries();
    loadActiveAyd();
    // eslint-disable-next-line
  }, []);

  const sortedDeaneries = useMemo(
    () => [...deaneries].sort((a, b) => (a.name > b.name ? 1 : -1)),
    [deaneries],
  );

  useEffect(() => {
    if (deaneryId) fetchParishes();
    else setParishes([]);
    // eslint-disable-next-line
  }, [deaneryId]);

  const filteredParish = useMemo(
    () => (parishes || []).filter((p) => p?.hasPaid !== false),
    [parishes],
  );

  const isFormStep = activeStep >= 1 && activeStep <= 4;

  return (
    <section className="ayd-light relative min-h-screen w-full overflow-hidden bg-[#f7f5ef]">
      {/* Cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-mesh-gold bg-[length:200%_200%] animate-gradient-pan opacity-80" />
        <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-multiply" />
        <div className="absolute -top-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[120px] animate-float-lg" />
        <div className="absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-green/20 blur-[130px] animate-float" />
        <div className="absolute top-1/3 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-primary-shade/15 blur-[100px] animate-pulse-soft" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f5ef]/60 via-transparent to-[#f7f5ef]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex flex-col items-center gap-5 pt-10 md:pt-14 px-6 md:px-10">
          <motion.a
            href="/"
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative inline-block"
          >
            <div className="absolute inset-0 -z-10 bg-primary/30 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" />
            <img
              src={AYDLogo}
              alt="Archdiocesan Youth Day"
              className="h-16 md:h-24 w-auto object-contain drop-shadow-2xl"
            />
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-shade backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse-soft" />
              Registration {REGISTRATION_OPEN ? "Open" : "Closed"}
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold text-zinc-900 tracking-tight">
              Archdiocesan Youth Day
            </h1>
            <p className="mt-1 text-sm md:text-base text-zinc-600 max-w-lg mx-auto">
              Join the Catholic Youth of the Lagos Archdiocese in a day of
              faith, fellowship and celebration.
            </p>
          </motion.div>

          {isFormStep && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="w-full"
            >
              <Stepper steps={STEP_LABELS} current={activeStep} />
            </motion.div>
          )}

          <AnimatePresence>
            {isFormStep && aydError && (
              <motion.div
                key="ayd-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                role="alert"
                className="w-full max-w-xl rounded-xl border border-danger/40 bg-danger-bg px-4 py-3 text-sm text-danger backdrop-blur-sm"
              >
                {aydError}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Form body */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-10 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-2xl"
          >
            <div className="relative">
              {/* Card gradient border */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/50 via-primary/15 to-green/40 opacity-80 blur-[2px]" />
              <div className="relative rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-card-premium">
                <div className="relative px-6 md:px-10 py-8 md:py-10">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    onKeyDown={handleKeyPress}
                  >
                    <AnimatePresence mode="wait">
                      {activeStep === 1 && (
                        <SelectInput
                          key="step-1"
                          loading={loadingDeaneries}
                          error={deaneryError}
                          onRetry={fetchDeaneries}
                          name="deaneryId"
                          start
                          label="Select your deanery"
                          placeholder="Select a deanery"
                          goBack={goBack}
                          next={next}
                          onChange={handleChange}
                          requestData={requestData}
                          disable={isEmpty(deaneryId)}
                          activeStep={activeStep}
                          setStep={setStep}
                          list={sortedDeaneries}
                          type="Deanery"
                        />
                      )}
                      {activeStep === 2 && (
                        <SelectInput
                          key="step-2"
                          loading={loadingParishes}
                          error={parishError}
                          onRetry={fetchParishes}
                          name="parishId"
                          label="Select your parish"
                          placeholder="Select a parish"
                          goBack={goBack}
                          next={next}
                          onChange={handleChange}
                          requestData={requestData}
                          disable={isEmpty(parishId)}
                          activeStep={activeStep}
                          setStep={setStep}
                          list={filteredParish}
                          type="Parish"
                        />
                      )}
                      {activeStep === 3 && (
                        <PersonalInfo
                          key="step-3"
                          requestData={requestData}
                          goBack={goBack}
                          next={next}
                          onChange={handleChange}
                        />
                      )}
                      {activeStep === 4 && (
                        <ContactOptions
                          key="step-4"
                          requestData={requestData}
                          goBack={goBack}
                          next={next}
                          isValid={isValid}
                          isValidNumber={isValidNumber}
                          onChange={handleChange}
                        />
                      )}
                      {activeStep === 5 && (
                        <ResultCard
                          key="success"
                          tone="success"
                          title="Registration successful"
                          message="Thank you. Your Archdiocesan Youth Day registration was received."
                          cta="You can now proceed to make payment."
                        />
                      )}
                      {activeStep === 6 && (
                        <ResultCard
                          key="closed"
                          tone="neutral"
                          title="Registration is closed"
                          message="Thank you. Registration for the Archdiocesan Youth Day has officially closed."
                        />
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className="py-6 text-center text-xs text-zinc-500">
          &copy; CYON Archdiocese of Lagos
        </footer>
      </div>
    </section>
  );
};

const ResultCard = ({ tone, title, message, cta }) => {
  const accent =
    tone === "success"
      ? "from-green/40 to-green/0 ring-green/40"
      : "from-primary/40 to-primary/0 ring-primary/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 18,
          delay: 0.1,
        }}
        className={`mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b ${accent} ring-1 shadow-xl`}
      >
        {tone === "success" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-12 w-12 text-green"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-12 w-12 text-primary"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        )}
      </motion.div>
      <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight mb-3">
        {title}
      </h2>
      <p className="text-base text-ink-muted leading-relaxed mb-2">{message}</p>
      {cta && (
        <p className="text-base text-ink-muted leading-relaxed mb-6">{cta}</p>
      )}
      <motion.a
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-green px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-green/30 hover:bg-green-shade transition-colors"
      >
        Close
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.06-1.06l4.25 4.24a.75.75 0 010 1.06l-4.25 4.24a.75.75 0 01-1.06 0z"
            clipRule="evenodd"
          />
        </svg>
      </motion.a>
    </motion.div>
  );
};

export default AYDModal;
