import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaEdit,
  FaMapMarkerAlt,
  FaPlus,
  FaShareAlt,
  FaSuitcaseRolling,
  FaTrash,
  FaBuilding,
  FaEllipsisH,
  FaPlane,
  FaUtensils,
  FaTicketAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./TripDetail.css";

import {
  getTrip,
  updateTrip,
  type Trip,
  type ProfileResponse,
  getProfileByProfileId,
} from "../api/tripsAPI";

import { getProfile } from "../api/profileAPI";

import {
  getBudgetByTripAndProfile,
  createBudget,
  updateBudget,
  type BudgetResponse,
} from "../api/budgetsAPI";

import {
  getNoteByTripAndProfile,
  createNotes,
  updateNotes,
  type NotesResponse,
} from "../api/notesAPI";

import {
  getTravelersByTripId,
  createTraveler,
  deleteTraveler,
  type TravelerResponse,
} from "../api/travelersAPI";

import {
  getDestinationsByTripId,
  createDestination,
  updateDestination,
  deleteDestination,
  type DestinationResponse,
} from "../api/destinationsAPI";

type Budget = {
  currency: string;
  total: number;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  misc: number;
};

type Destination = {
  destinationId: string;
  tripId: string;
  name: string;
  latitude: number;
  longitude: number;
  arrivalDate: string;
  leaveDate: string;
  createdAt: string;
  updatedAt: string;
};

const emptyBudget: Budget = {
  currency: "USD",
  total: 0,
  flights: 0,
  accommodation: 0,
  food: 0,
  activities: 0,
  misc: 0,
};

const emptyDestination: Destination = {
  destinationId: "",
  tripId: "",
  name: "",
  latitude: 0,
  longitude: 0,
  arrivalDate: "",
  leaveDate: "",
  createdAt: "",
  updatedAt: "",
};

const budgetFields = [
  "flights",
  "accommodation",
  "food",
  "activities",
  "misc",
] as const;

const normalizeTrip = (value: Trip): Trip => ({
  ...value,
});

const getToday = () => new Date().toISOString().slice(0, 10);

const addOneDay = (date: string) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
};

const formatDate = (date: string, includeYear = true) => {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(new Date(`${date}T00:00:00`));
};

const getNights = (start: string, end: string) => {
  if (!start || !end) return 0;

  return Math.max(
    0,
    Math.round(
      (new Date(`${end}T00:00:00`).getTime() -
        new Date(`${start}T00:00:00`).getTime()) /
        86_400_000,
    ),
  );
};

const getDaysAway = (start: string) => {
  if (!start) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (new Date(`${start}T00:00:00`).getTime() - today.getTime()) / 86_400_000,
  );
};

const safeAmount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCurrencySymbol = (currency: string): string => {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);

    return parts.find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
};

const formatBudgetNumber = (value: unknown): string => {
  return safeAmount(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [draftTrip, setDraftTrip] = useState<Trip | null>(null);

  const [destinations, setDestinations] = useState<DestinationResponse[]>([]);
  const [draftDestinations, setDraftDestinations] = useState<Destination[]>([]);

  const [budgetRecord, setBudgetRecord] = useState<BudgetResponse | null>(null);
  const [budget, setBudget] = useState<Budget>(emptyBudget);
  const [draftBudget, setDraftBudget] = useState<Budget>(emptyBudget);

  const [note, setNote] = useState<NotesResponse | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const [travelers, setTravelers] = useState<TravelerResponse[]>([]);
  const [draftTravelers, setDraftTravelers] = useState<TravelerResponse[]>([]);

  const [travelerProfiles, setTravelerProfiles] = useState<ProfileResponse[]>(
    [],
  );

  const [draftTravelerProfiles, setDraftTravelerProfiles] = useState<
    ProfileResponse[]
  >([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [travelerEmail, setTravelerEmail] = useState("");

  const [checklist, setChecklist] = useState([
    { id: 1, label: "Book flights", done: false },
    { id: 2, label: "Reserve accommodation", done: false },
    { id: 3, label: "Travel insurance", done: false },
    { id: 4, label: "Plan activities", done: false },
    { id: 5, label: "Currency and spending money", done: false },
  ]);

  useEffect(() => {
    const loadTrip = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const savedProfile = localStorage.getItem("profile");

      const profileId = savedProfile
        ? JSON.parse(savedProfile).profileId
        : null;

      if (!accessToken) {
        toast.error("Please log in again.");
        navigate("/login");
        return;
      }

      if (!profileId) {
        toast.error("Profile ID is missing.");
        navigate("/login");
        return;
      }

      if (!tripId) {
        toast.error("Trip ID is missing.");
        navigate("/home");
        return;
      }

      try {
        setLoading(true);

        const loadedTrip = normalizeTrip(
          await getTrip(tripId, accessToken),
        );

        setTrip(loadedTrip);
        setDraftTrip(structuredClone(loadedTrip));

        const [
          destinationsResult,
          budgetResult,
          noteResult,
          travelersResult,
        ] = await Promise.allSettled([
          getDestinationsByTripId(
            tripId,
            accessToken,
          ),
          getBudgetByTripAndProfile(
            tripId,
            profileId,
            accessToken,
          ),
          getNoteByTripAndProfile(
            tripId,
            profileId,
            accessToken,
          ),
          getTravelersByTripId(
            tripId,
            accessToken,
          ),
        ]);

        if (destinationsResult.status === "fulfilled") {
          const loadedDestinations = destinationsResult.value;

          setDestinations(loadedDestinations);
          setDraftDestinations(
            structuredClone(loadedDestinations),
          );
        } else {
          setDestinations([]);
          setDraftDestinations([]);
        }

        if (budgetResult.status === "fulfilled") {
          const loadedBudget = budgetResult.value;

          const formattedBudget: Budget = {
            currency: "USD",
            total: safeAmount(loadedBudget.total),
            flights: safeAmount(loadedBudget.flights),
            accommodation: safeAmount(
              loadedBudget.accommodation,
            ),
            food: safeAmount(loadedBudget.food),
            activities: safeAmount(
              loadedBudget.activities,
            ),
            misc: safeAmount(loadedBudget.misc),
          };

          setBudgetRecord(loadedBudget);
          setBudget(formattedBudget);
          setDraftBudget(formattedBudget);
        } else {
          setBudgetRecord(null);
          setBudget(emptyBudget);
          setDraftBudget(emptyBudget);
        }

        if (noteResult.status === "fulfilled") {
          setNote(noteResult.value);
          setDraftNote(noteResult.value.text ?? "");
        } else {
          setNote(null);
          setDraftNote("");
        }

        if (travelersResult.status === "fulfilled") {
          const loadedTravelers = travelersResult.value;

          setTravelers(loadedTravelers);
          setDraftTravelers(
            structuredClone(loadedTravelers),
          );

          const profiles = await Promise.all(
            loadedTravelers.map((traveler) =>
              getProfileByProfileId(
                traveler.profileId,
                accessToken,
              ),
            ),
          );

          setTravelerProfiles(profiles);
          setDraftTravelerProfiles(
            structuredClone(profiles),
          );
        } else {
          setTravelers([]);
          setDraftTravelers([]);
          setTravelerProfiles([]);
          setDraftTravelerProfiles([]);
        }
      } catch (error) {
        console.error("Failed to load trip:", error);
        toast.error("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    };

    void loadTrip();
  }, [navigate, tripId]);

  const shownTrip = editing ? draftTrip : trip;

  const shownDestinations = editing
    ? draftDestinations
    : destinations;

  const shownBudget = editing ? draftBudget : budget;

  const shownTravelerProfiles = editing
    ? draftTravelerProfiles
    : travelerProfiles;

  const destinationRoute = useMemo(
    () =>
      shownDestinations
        .map((destination) => destination.name)
        .filter(Boolean)
        .join(" → "),
    [shownDestinations],
  );

  const handleEdit = () => {
    if (!trip) return;

    setDraftTrip(structuredClone(trip));
    setDraftDestinations(
      structuredClone(destinations),
    );
    setDraftBudget({ ...budget });
    setDraftNote(note?.text ?? "");
    setDraftTravelers(structuredClone(travelers));
    setDraftTravelerProfiles(
      structuredClone(travelerProfiles),
    );
    setEditing(true);
  };

  const handleCancel = () => {
    if (!trip) return;

    setDraftTrip(structuredClone(trip));
    setDraftDestinations(
      structuredClone(destinations),
    );
    setDraftBudget({ ...budget });
    setDraftNote(note?.text ?? "");
    setDraftTravelers(structuredClone(travelers));
    setDraftTravelerProfiles(
      structuredClone(travelerProfiles),
    );
    setTravelerEmail("");
    setEditing(false);
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("profile");

    const profileId = savedProfile
      ? JSON.parse(savedProfile).profileId
      : null;

    if (!accessToken || !profileId || !tripId || !draftTrip) {
      return;
    }

    try {
      setSaving(true);

      const updatedTrip = normalizeTrip(
        await updateTrip(
          tripId,
          {
            tripName: draftTrip.tripName,
            status: draftTrip.status,
          },
          accessToken,
        ),
      );

      const removedDestinations = destinations.filter(
        (destination) =>
          !draftDestinations.some(
            (draftDestination) =>
              draftDestination.destinationId ===
              destination.destinationId,
          ),
      );

      await Promise.all(
        removedDestinations.map((destination) =>
          deleteDestination(
            destination.destinationId,
            accessToken,
          ),
        ),
      );

      const existingDestinations = draftDestinations.filter(
        (destination) => destination.destinationId !== "",
      );

      const updatedDestinations = await Promise.all(
        existingDestinations.map((destination) =>
          updateDestination(
            destination.destinationId,
            {
              name: destination.name,
              latitude: destination.latitude,
              longitude: destination.longitude,
              arrivalDate: destination.arrivalDate,
              leaveDate: destination.leaveDate,
            },
            accessToken,
          ),
        ),
      );

      const newDestinations = draftDestinations.filter(
        (destination) => destination.destinationId === "",
      );

      const createdDestinations = await Promise.all(
        newDestinations.map((destination) =>
          createDestination(
            {
              tripId,
              name: destination.name,
              latitude: destination.latitude,
              longitude: destination.longitude,
              arrivalDate: destination.arrivalDate,
              leaveDate: destination.leaveDate,
            },
            accessToken,
          ),
        ),
      );

      const savedDestinations = [
        ...updatedDestinations,
        ...createdDestinations,
      ];

      let savedBudget: BudgetResponse;

      if (budgetRecord?.budgetId) {
        savedBudget = await updateBudget(
          budgetRecord.budgetId,
          {
            total: draftBudget.total,
            flights: draftBudget.flights,
            accommodation: draftBudget.accommodation,
            food: draftBudget.food,
            activities: draftBudget.activities,
            misc: draftBudget.misc,
          },
          accessToken,
        );
      } else {
        savedBudget = await createBudget(
          {
            tripId,
            profileId,
            total: draftBudget.total,
            flights: draftBudget.flights,
            accommodation: draftBudget.accommodation,
            food: draftBudget.food,
            activities: draftBudget.activities,
            misc: draftBudget.misc,
          },
          accessToken,
        );
      }

      let savedNote = note;

      if (draftNote.trim() !== "") {
        if (note?.noteId) {
          savedNote = await updateNotes(
            note.noteId,
            {
              text: draftNote.trim(),
            },
            accessToken,
          );
        } else {
          savedNote = await createNotes(
            {
              tripId,
              profileId,
              text: draftNote.trim(),
            },
            accessToken,
          );
        }
      }

      const removedTravelers = travelers.filter(
        (traveler) =>
          !draftTravelers.some(
            (draftTraveler) =>
              draftTraveler.profileId ===
              traveler.profileId,
          ),
      );

      await Promise.all(
        removedTravelers.map((traveler) =>
          deleteTraveler(
            traveler.travelerId,
            accessToken,
          ),
        ),
      );

      const addedTravelers = draftTravelers.filter(
        (draftTraveler) =>
          !travelers.some(
            (traveler) =>
              traveler.profileId ===
              draftTraveler.profileId,
          ),
      );

      const createdTravelers = await Promise.all(
        addedTravelers.map((traveler) =>
          createTraveler(
            {
              tripId,
              profileId: traveler.profileId,
              email: traveler.email,
            },
            accessToken,
          ),
        ),
      );

      const existingTravelers = draftTravelers.filter(
        (draftTraveler) =>
          travelers.some(
            (traveler) =>
              traveler.profileId ===
              draftTraveler.profileId,
          ),
      );

      const savedTravelers = [
        ...existingTravelers,
        ...createdTravelers,
      ];

      setTrip(updatedTrip);
      setDraftTrip(structuredClone(updatedTrip));

      setDestinations(savedDestinations);
      setDraftDestinations(
        structuredClone(savedDestinations),
      );

      setBudgetRecord(savedBudget);
      setBudget({ ...draftBudget });

      setNote(savedNote);

      setTravelers(savedTravelers);
      setDraftTravelers(
        structuredClone(savedTravelers),
      );

      setTravelerProfiles(
        structuredClone(draftTravelerProfiles),
      );

      setEditing(false);
      toast.success("Trip updated.");
    } catch (error) {
      console.error("Failed to update trip:", error);
      toast.error("Failed to update trip.");
    } finally {
      setSaving(false);
    }
  };

  const updateDestinationField = (
    index: number,
    field: keyof Destination,
    value: string,
  ) => {
    setDraftDestinations((current) => {
      const destination = current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]:
                  field === "latitude" ||
                  field === "longitude"
                    ? Number(value)
                    : value,
              }
            : item,
      );

      if (
        field === "arrivalDate" &&
        destination[index].leaveDate &&
        destination[index].leaveDate < value
      ) {
        destination[index].leaveDate = "";
      }

      return destination;
    });
  };

  const addDestination = () => {
    if (!tripId) return;

    setDraftDestinations((current) => [
      ...current,
      {
        ...emptyDestination,
        tripId,
      },
    ]);
  };

  const removeDestination = (index: number) => {
    setDraftDestinations((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index,
      );
    });
  };

  const updateDraftBudget = (
    field: keyof Budget,
    value: string,
  ) => {
    setDraftBudget((current) => ({
      ...current,
      [field]:
        field === "currency"
          ? value
          : Number(value) || 0,
    }));
  };

  const addTraveler = async () => {
    const email = travelerEmail.trim().toLowerCase();

    if (!email || !tripId) return;

    const accessToken =
      localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const travelerProfile = await getProfile(
        email,
        accessToken,
      );

      const alreadyExists =
        draftTravelerProfiles.some(
          (profile) =>
            profile.profileId ===
            travelerProfile.profileId,
        );

      if (alreadyExists) {
        toast.error(
          "Traveler is already on this trip.",
        );
        return;
      }

      const newTraveler: TravelerResponse = {
        travelerId: "",
        tripId,
        profileId: travelerProfile.profileId,
        email: travelerProfile.email,
        createdAt: "",
        updatedAt: "",
      };

      setDraftTravelers((current) => [
        ...current,
        newTraveler,
      ]);

      setDraftTravelerProfiles((current) => [
        ...current,
        travelerProfile,
      ]);

      setTravelerEmail("");
    } catch (error) {
      console.error(
        "Failed to add traveler:",
        error,
      );

      toast.error(
        "Could not find traveler profile.",
      );
    }
  };

  const removeTraveler = (
    profileId: string,
  ) => {
    setDraftTravelers((current) =>
      current.filter(
        (traveler) =>
          traveler.profileId !== profileId,
      ),
    );

    setDraftTravelerProfiles((current) =>
      current.filter(
        (profile) =>
          profile.profileId !== profileId,
      ),
    );
  };

  if (loading) {
    return (
      <div className="trip-detail-loading">
        Loading trip...
      </div>
    );
  }

  if (!trip || !draftTrip || !shownTrip) {
    return (
      <div className="trip-detail-error">
        <p>Trip could not be loaded.</p>

        <button
          type="button"
          onClick={() => navigate("/home")}
        >
          Back to home
        </button>
      </div>
    );
  }

  const allocatedBudget =
    shownBudget.flights +
    shownBudget.accommodation +
    shownBudget.food +
    shownBudget.activities +
    shownBudget.misc;

  const remainingBudget =
    shownBudget.total - allocatedBudget;

  const isFullyAllocated =
    remainingBudget === 0;

  const currencySymbol =
    getCurrencySymbol(shownBudget.currency);

  const startDate =
    shownDestinations[0]?.arrivalDate ?? "";

  const endDate =
    shownDestinations[
      shownDestinations.length - 1
    ]?.leaveDate ?? "";

  const nights =
    getNights(startDate, endDate);

  const daysAway =
    getDaysAway(startDate);

  const travelerCount =
    shownTravelerProfiles.length + 1;

  const completedTasks =
    checklist.filter((item) => item.done).length;

  const progress = Math.round(
    (completedTasks / checklist.length) * 100,
  );

  return (
    <div className="trip-detail-page">
      <section className="trip-hero">
        <div className="trip-hero-inner">
          <div className="trip-hero-top">
            <button
              className="hero-back"
              onClick={() =>
                navigate("/home")
              }
            >
              <FaArrowLeft /> Back to My trips
            </button>

            <div className="trip-hero-actions">
              <button
                className="hero-button ghost"
                onClick={() =>
                  toast(
                    "Share feature coming next.",
                  )
                }
              >
                <FaShareAlt /> Share
              </button>

              {editing ? (
                <>
                  <button
                    className="hero-button ghost"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  <button
                    className="hero-button solid"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FaCheck />{" "}
                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </>
              ) : (
                <button
                  className="hero-button solid"
                  onClick={handleEdit}
                >
                  <FaEdit /> Edit trip
                </button>
              )}
            </div>
          </div>

          <div className="trip-hero-main">
            <div className="trip-hero-icon">
              <FaSuitcaseRolling />
            </div>

            <div className="trip-hero-info">
              <div className="trip-title-row">
                {editing ? (
                  <input
                    className="trip-name-input"
                    value={draftTrip.tripName}
                    onChange={(event) =>
                      setDraftTrip((current) =>
                        current
                          ? {
                              ...current,
                              tripName:
                                event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                ) : (
                  <h1>{trip.tripName}</h1>
                )}

                <span className="status-badge">
                  {shownTrip.status ?? "PLANNING"}
                </span>
              </div>

              <div className="trip-route">
                <FaMapMarkerAlt />
                {destinationRoute ||
                  "No destinations added"}
              </div>

              <div className="trip-meta">
                <span>
                  <FaCalendarAlt />
                  {startDate && endDate
                    ? `${formatDate(
                        startDate,
                        false,
                      )} – ${formatDate(
                        endDate,
                      )}`
                    : "Dates not set"}
                </span>

                {nights > 0 && (
                  <span>• {nights} nights</span>
                )}

                {daysAway !== null &&
                  daysAway >= 0 && (
                    <span className="days-away">
                      {daysAway === 0
                        ? "Starts today"
                        : `${daysAway} days away`}
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="trip-stats">
            <div>
              <strong>{travelerCount}</strong>
              <span>Travelers</span>
            </div>

            <i />

            <div>
              <strong>
                {shownBudget.currency}{" "}
                {Number(
                  shownBudget.total,
                ).toLocaleString()}
              </strong>
              <span>Total budget</span>
            </div>

            <i />

            <div>
              <strong>
                {completedTasks}/{checklist.length}
              </strong>
              <span>Tasks done</span>
            </div>

            <i />

            <div>
              <strong>
                {shownTravelerProfiles.length}
              </strong>
              <span>Collaborators</span>
            </div>
          </div>
        </div>
      </section>

      <main className="trip-content-layout">
        <section className="trip-main-column">
          <article className="trip-card itinerary-card">
            <div className="card-heading">
              <div>
                <h2>Itinerary</h2>
                <p>Where you are headed and when</p>
              </div>
            </div>

            <div className="itinerary-list">
              {shownDestinations.map(
                (destination, index) => {
                  const previousLeavingDate =
                    index > 0
                      ? shownDestinations[
                          index - 1
                        ].leaveDate
                      : "";

                  const arrivalMin =
                    index === 0
                      ? getToday()
                      : previousLeavingDate
                        ? addOneDay(
                            previousLeavingDate,
                          )
                        : getToday();

                  return editing ? (
                    <div
                      className="editable-stop"
                      key={
                        destination.destinationId ||
                        index
                      }
                    >
                      <div className="stop-number">
                        {index + 1}
                      </div>

                      <div className="editable-stop-main">
                        <input
                          className="destination-input"
                          value={destination.name}
                          placeholder="Search a city, resort, or country"
                          onChange={(event) =>
                            updateDestinationField(
                              index,
                              "name",
                              event.target.value,
                            )
                          }
                        />

                        <div className="date-grid">
                          <label>
                            Arriving

                            <input
                              type="date"
                              value={
                                destination.arrivalDate
                              }
                              min={arrivalMin}
                              disabled={
                                index > 0 &&
                                !previousLeavingDate
                              }
                              onChange={(event) =>
                                updateDestinationField(
                                  index,
                                  "arrivalDate",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label>
                            Leaving

                            <input
                              type="date"
                              value={
                                destination.leaveDate
                              }
                              min={
                                destination.arrivalDate ||
                                getToday()
                              }
                              disabled={
                                !destination.arrivalDate
                              }
                              onChange={(event) =>
                                updateDestinationField(
                                  index,
                                  "leaveDate",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        className="remove-stop"
                        onClick={() =>
                          removeDestination(index)
                        }
                        disabled={
                          shownDestinations.length <= 1
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="itinerary-row"
                      key={
                        destination.destinationId ||
                        index
                      }
                    >
                      <div className="stop-number">
                        {index + 1}
                      </div>

                      <div className="stop-details">
                        <div className="stop-name">
                          {destination.name ||
                            "Unnamed destination"}
                        </div>

                        <div className="stop-dates">
                          Arriving{" "}
                          {formatDate(
                            destination.arrivalDate,
                          )}{" "}
                          · Leaving{" "}
                          {formatDate(
                            destination.leaveDate,
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {editing && (
              <button
                className="add-stop"
                onClick={addDestination}
              >
                <FaPlus /> Add another stop
              </button>
            )}
          </article>

          <article className="trip-card budget-card">
            <div className="budget-card-heading">
              <h2>Budget</h2>
              <p>Total budget for your trip</p>
            </div>

            {editing ? (
              <div className="budget-edit-content">
                <div className="budget-edit-top">
                  <label>
                    <span>Currency</span>

                    <select
                      value={draftBudget.currency}
                      onChange={(event) =>
                        updateDraftBudget(
                          "currency",
                          event.target.value,
                        )
                      }
                    >
                      <option value="USD">
                        USD — US Dollar
                      </option>
                      <option value="CAD">
                        CAD — Canadian Dollar
                      </option>
                      <option value="EUR">
                        EUR — Euro
                      </option>
                      <option value="GBP">
                        GBP — British Pound
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Total budget</span>

                    <input
                      type="number"
                      min="0"
                      value={draftBudget.total}
                      onChange={(event) =>
                        updateDraftBudget(
                          "total",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>

                <div className="budget-edit-categories">
                  {budgetFields.map((field) => (
                    <label
                      className="budget-edit-row"
                      key={field}
                    >
                      <span>
                        {field === "misc"
                          ? "Other / misc"
                          : field === "food"
                            ? "Food & drink"
                            : field
                                .charAt(0)
                                .toUpperCase() +
                              field.slice(1)}
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={draftBudget[field]}
                        onChange={(event) =>
                          updateDraftBudget(
                            field,
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="budget-display">
                <div className="budget-total-display">
                  <span className="budget-total-symbol">
                    {currencySymbol}
                  </span>

                  <strong>
                    {formatBudgetNumber(
                      shownBudget.total,
                    )}
                  </strong>
                </div>

                <div className="budget-allocation-header">
                  <span>Allocation by category</span>

                  <span
                    className={
                      isFullyAllocated
                        ? "allocation-status complete"
                        : remainingBudget > 0
                          ? "allocation-status remaining"
                          : "allocation-status over"
                    }
                  >
                    {isFullyAllocated
                      ? "Fully allocated"
                      : remainingBudget > 0
                        ? `${currencySymbol}${formatBudgetNumber(
                            remainingBudget,
                          )} remaining`
                        : `${currencySymbol}${formatBudgetNumber(
                            Math.abs(
                              remainingBudget,
                            ),
                          )} over budget`}
                  </span>
                </div>

                <div className="budget-category-list">
                  <div className="budget-category-row">
                    <div className="budget-category-name">
                      <FaPlane />
                      <span>Flights</span>
                    </div>

                    <div className="budget-category-value">
                      <span className="category-currency">
                        {currencySymbol}
                      </span>
                      <strong>
                        {formatBudgetNumber(
                          shownBudget.flights,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-category-row">
                    <div className="budget-category-name">
                      <FaBuilding />
                      <span>Accommodation</span>
                    </div>

                    <div className="budget-category-value">
                      <span className="category-currency">
                        {currencySymbol}
                      </span>
                      <strong>
                        {formatBudgetNumber(
                          shownBudget.accommodation,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-category-row">
                    <div className="budget-category-name">
                      <FaUtensils />
                      <span>Food &amp; drink</span>
                    </div>

                    <div className="budget-category-value">
                      <span className="category-currency">
                        {currencySymbol}
                      </span>
                      <strong>
                        {formatBudgetNumber(
                          shownBudget.food,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-category-row">
                    <div className="budget-category-name">
                      <FaTicketAlt />
                      <span>Activities</span>
                    </div>

                    <div className="budget-category-value">
                      <span className="category-currency">
                        {currencySymbol}
                      </span>
                      <strong>
                        {formatBudgetNumber(
                          shownBudget.activities,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="budget-category-row">
                    <div className="budget-category-name">
                      <FaEllipsisH />
                      <span>Other / misc</span>
                    </div>

                    <div className="budget-category-value">
                      <span className="category-currency">
                        {currencySymbol}
                      </span>
                      <strong>
                        {formatBudgetNumber(
                          shownBudget.misc,
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="trip-card">
            <div className="card-heading">
              <div>
                <h2>Notes</h2>
                <p>Anything worth remembering</p>
              </div>
            </div>

            {editing ? (
              <textarea
                className="notes-input"
                value={draftNote}
                onChange={(event) =>
                  setDraftNote(event.target.value)
                }
                placeholder="Add notes..."
              />
            ) : (
              <p className="notes-view">
                {note?.text || "No notes added."}
              </p>
            )}
          </article>
        </section>

        <aside className="trip-sidebar">
          <h2 className="sidebar-title">
            Trip checklist
          </h2>

          <article className="sidebar-card">
            <div className="progress-track">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="progress-label">
              {completedTasks} of{" "}
              {checklist.length} tasks done
            </p>

            <div className="checklist">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setChecklist((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id
                          ? {
                              ...candidate,
                              done: !candidate.done,
                            }
                          : candidate,
                      ),
                    )
                  }
                >
                  <span
                    className={`check-box ${
                      item.done ? "done" : ""
                    }`}
                  >
                    {item.done && <FaCheck />}
                  </span>

                  <span
                    className={
                      item.done
                        ? "done-label"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </article>

          <h2 className="sidebar-title">
            Travelers
          </h2>

          <article className="sidebar-card">
            <div className="traveler-row">
              <div className="traveler-avatar owner">
                YO
              </div>

              <div>
                <strong>You</strong>
                <span>Trip owner</span>
              </div>
            </div>

            {shownTravelerProfiles.map(
              (profile) => {
                const fullName =
                  `${profile.firstName ?? ""} ${
                    profile.lastName ?? ""
                  }`.trim();

                return (
                  <div
                    className="traveler-row"
                    key={profile.profileId}
                  >
                    <div className="traveler-avatar">
                      {`${profile.firstName?.[0] ?? ""}${
                        profile.lastName?.[0] ??
                        ""
                      }`.toUpperCase()}
                    </div>

                    <div className="traveler-info">
                      <strong>
                        {fullName || profile.email}
                      </strong>

                      <span>{profile.email}</span>
                    </div>

                    {editing && (
                      <button
                        className="remove-traveler"
                        onClick={() =>
                          removeTraveler(
                            profile.profileId,
                          )
                        }
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              },
            )}

            {editing && (
              <div className="invite-row">
                <input
                  type="email"
                  value={travelerEmail}
                  placeholder="Add email address"
                  onChange={(event) =>
                    setTravelerEmail(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addTraveler();
                    }
                  }}
                />

                <button
                  onClick={() =>
                    void addTraveler()
                  }
                >
                  Invite
                </button>
              </div>
            )}
          </article>
        </aside>
      </main>
    </div>
  );
}