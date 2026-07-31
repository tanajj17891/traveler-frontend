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
  FaTicketAlt
 
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./TripDetail.css";

import {
  getTrip,
  updateTrip,
  type Budget,
  type Destination,
  type Trip,
  type ProfileResponse,
  getProfileByProfileId,
} from "../api/tripsAPI";

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
  name: "",
  latitude: 0,
  longitude: 0,
  arrivalDate: "",
  leaveDate: "",
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
  destination: Array.isArray(value.destination)
    ? value.destination.map((destination) => ({
        ...destination,
        arrivalDate: destination.arrivalDate ?? "",
        leaveDate: destination.leaveDate ?? "",
      }))
    : [],
  travelers: Array.isArray(value.travelers) ? value.travelers : [],
  notes: Array.isArray(value.notes) ? value.notes : [],
  budget: value.budget ?? emptyBudget,
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
  console.log("Current browser URL:", window.location.pathname);
  console.log("Trip ID from useParams:", tripId);
  console.log("Trip ID from URL:", tripId);
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [draftTrip, setDraftTrip] = useState<Trip | null>(null);
  const [travelerProfiles, setTravelerProfiles] = useState<ProfileResponse[]>(
    [],
  );
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

      if (!accessToken) {
        toast.error("Please log in again.");
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
    

        const loadedTrip = normalizeTrip(await getTrip(tripId, accessToken));
        setTrip(loadedTrip);
        setDraftTrip(structuredClone(loadedTrip));
     
        const profiles = await Promise.all(
          loadedTrip.travelers.map((profileId) =>
            getProfileByProfileId(profileId, accessToken),
          ),
        );
        setTravelerProfiles(profiles);
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

  const destinationRoute = useMemo(
    () =>
      shownTrip?.destination
        .map((destination) => destination.name)
        .filter(Boolean)
        .join(" → ") ?? "",
    [shownTrip],
  );

  const handleEdit = () => {
    if (!trip) return;
    setDraftTrip(structuredClone(trip));
    setEditing(true);
  };

  const handleCancel = () => {
    if (!trip) return;
    setDraftTrip(structuredClone(trip));
    setTravelerEmail("");
    setEditing(false);
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !tripId || !draftTrip) return;

    try {
      setSaving(true);
      const updated = normalizeTrip(
        await updateTrip(
          tripId,
          {
            tripName: draftTrip.tripName,
            destination: draftTrip.destination,
            travelers: draftTrip.travelers,
            budget: draftTrip.budget,
            notes: draftTrip.notes,
            status: draftTrip.status,
          },
          accessToken,
        ),
      );

      setTrip(updated);
      setDraftTrip(structuredClone(updated));
      setEditing(false);
      toast.success("Trip updated.");
    } catch (error) {
      console.error("Failed to update trip:", error);
      toast.error("Failed to update trip.");
    } finally {
      setSaving(false);
    }
  };

  const updateDestination = (
    index: number,
    field: keyof Destination,
    value: string,
  ) => {
    setDraftTrip((current) => {
      if (!current) return current;

      const destination = current.destination.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );

      if (
        field === "arrivalDate" &&
        destination[index].leaveDate &&
        destination[index].leaveDate < value
      ) {
        destination[index].leaveDate = "";
      }

      return { ...current, destination };
    });
  };

  const addDestination = () => {
    setDraftTrip((current) =>
      current
        ? {
            ...current,
            destination: [...current.destination, { ...emptyDestination }],
          }
        : current,
    );
  };

  const removeDestination = (index: number) => {
    setDraftTrip((current) => {
      if (!current || current.destination.length <= 1) return current;
      return {
        ...current,
        destination: current.destination.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  };

  const updateBudget = (field: keyof Budget, value: string) => {
    setDraftTrip((current) =>
      current
        ? {
            ...current,
            budget: {
              ...(current.budget ?? emptyBudget),
              [field]: field === "currency" ? value : Number(value) || 0,
            },
          }
        : current,
    );
  };

  const addTraveler = () => {
    const email = travelerEmail.trim();
    if (!email || draftTrip?.travelers.includes(email)) return;

    setDraftTrip((current) =>
      current
        ? { ...current, travelers: [...current.travelers, email] }
        : current,
    );
    setTravelerEmail("");
  };

 const removeTraveler = (profileId: string) => {
  setDraftTrip((current) =>
    current
      ? {
          ...current,
          travelers: current.travelers.filter(
            (travelerId) => travelerId !== profileId,
          ),
        }
      : current,
  );

  setTravelerProfiles((current) =>
    current.filter(
      (profile) => profile.profileId !== profileId,
    ),
  );
};

  if (loading)
    return <div className="trip-detail-loading">Loading trip...</div>;

  if (!trip || !draftTrip || !shownTrip) {
    return (
      <div className="trip-detail-error">
        <p>Trip could not be loaded.</p>
        <button type="button" onClick={() => navigate("/home")}>
          Back to home
        </button>
      </div>
    );
  }
const budget: Budget = {
  currency: shownTrip.budget?.currency || "USD",
  total: safeAmount(shownTrip.budget?.total),
  flights: safeAmount(shownTrip.budget?.flights),
  accommodation: safeAmount(shownTrip.budget?.accommodation),
  food: safeAmount(shownTrip.budget?.food),
  activities: safeAmount(shownTrip.budget?.activities),
  misc: safeAmount(shownTrip.budget?.misc),
};

const allocatedBudget =
  budget.flights +
  budget.accommodation +
  budget.food +
  budget.activities +
  budget.misc;

const remainingBudget = budget.total - allocatedBudget;
const isFullyAllocated = remainingBudget === 0;
const currencySymbol = getCurrencySymbol(budget.currency);
  const startDate = shownTrip.destination[0]?.arrivalDate ?? "";
  const endDate =
    shownTrip.destination[shownTrip.destination.length - 1]?.leaveDate ?? "";
  const nights = getNights(startDate, endDate);
  const daysAway = getDaysAway(startDate);
  const travelerCount = shownTrip.travelers.length + 1;
  const completedTasks = checklist.filter((item) => item.done).length;
  const progress = Math.round((completedTasks / checklist.length) * 100);

  return (
    <div className="trip-detail-page">
      
      <section className="trip-hero">
        <div className="trip-hero-inner">
          <div className="trip-hero-top">
            <button className="hero-back" onClick={() => navigate("/home")}>
              <FaArrowLeft /> Back to My trips
            </button>

            <div className="trip-hero-actions">
              <button
                className="hero-button ghost"
                onClick={() => toast("Share feature coming next.")}
              >
                <FaShareAlt /> Share
              </button>

              {editing ? (
                <>
                  <button className="hero-button ghost" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button
                    className="hero-button solid"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FaCheck /> {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <button className="hero-button solid" onClick={handleEdit}>
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
                          ? { ...current, tripName: event.target.value }
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
                {destinationRoute || "No destinations added"}
              </div>

              <div className="trip-meta">
                <span>
                  <FaCalendarAlt />
                  {startDate && endDate
                    ? `${formatDate(startDate, false)} – ${formatDate(endDate)}`
                    : "Dates not set"}
                </span>
                {nights > 0 && <span>• {nights} nights</span>}
                {daysAway !== null && daysAway >= 0 && (
                  <span className="days-away">
                    {daysAway === 0 ? "Starts today" : `${daysAway} days away`}
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
                {budget.currency} {Number(budget.total).toLocaleString()}
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
              <strong>{shownTrip.travelers.length}</strong>
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
            <div className="itinerary-list"></div>

            {shownTrip.destination.map((destination, index) => {
              const previousLeavingDate =
                index > 0 ? shownTrip.destination[index - 1].leaveDate : "";
              const arrivalMin =
                index === 0
                  ? getToday()
                  : previousLeavingDate
                    ? addOneDay(previousLeavingDate)
                    : getToday();

              return editing ? (
                <div className="editable-stop" key={index}>
                  <div className="stop-number">{index + 1}</div>
                  
                  <div className="editable-stop-main">
                    <input
                      className="destination-input"
                      value={destination.name}
                      placeholder="Search a city, resort, or country"
                      onChange={(event) =>
                        updateDestination(index, "name", event.target.value)
                      }
                    />
                    <div className="date-grid">
                      <label>
                        Arriving
                        <input
                          type="date"
                          value={destination.arrivalDate}
                          min={arrivalMin}
                          disabled={index > 0 && !previousLeavingDate}
                          onChange={(event) =>
                            updateDestination(
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
                          value={destination.leaveDate}
                          min={destination.arrivalDate || getToday()}
                          disabled={!destination.arrivalDate}
                          onChange={(event) =>
                            updateDestination(
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
                    onClick={() => removeDestination(index)}
                    disabled={shownTrip.destination.length <= 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              ) : (
                <div className="itinerary-row" key={index}>
                  <div className="stop-number">{index + 1}</div>
                  <div className="stop-details">
                    <div className="stop-name">
                      {destination.name || "Unnamed destination"}
                    </div>
                    <div className="stop-dates">
                      Arriving {formatDate(destination.arrivalDate)} · Leaving{" "}
                      {formatDate(destination.leaveDate)}
                    </div>
                  </div>
                </div>
              );
              
            })}
           
            {editing && (
              <button className="add-stop" onClick={addDestination}>
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
            value={budget.currency}
            onChange={(event) =>
              updateBudget("currency", event.target.value)
            }
          >
            <option value="USD">USD — US Dollar</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </label>

        <label>
          <span>Total budget</span>
          <input
            type="number"
            min="0"
            value={budget.total}
            onChange={(event) =>
              updateBudget("total", event.target.value)
            }
          />
        </label>
      </div>

      <div className="budget-edit-categories">
        {budgetFields.map((field) => (
          <label className="budget-edit-row" key={field}>
            <span>
              {field === "misc"
                ? "Other / misc"
                : field === "food"
                  ? "Food & drink"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
            </span>

            <input
              type="number"
              min="0"
              value={budget[field]}
              onChange={(event) =>
                updateBudget(field, event.target.value)
              }
            />
          </label>
        ))}
      </div>
    </div>
  ) : (
    <div className="budget-display">
      <div className="budget-total-display">
        <span className="budget-total-symbol">{currencySymbol}</span>
        <strong>{formatBudgetNumber(budget.total)}</strong>
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
                  Math.abs(remainingBudget),
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
            <strong>{formatBudgetNumber(budget.flights)}</strong>
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
              {formatBudgetNumber(budget.accommodation)}
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
            <strong>{formatBudgetNumber(budget.food)}</strong>
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
              {formatBudgetNumber(budget.activities)}
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
            <strong>{formatBudgetNumber(budget.misc)}</strong>
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
                value={draftTrip.notes[0] ?? ""}
                onChange={(event) =>
                  setDraftTrip((current) =>
                    current
                      ? {
                          ...current,
                          notes: event.target.value ? [event.target.value] : [],
                        }
                      : current,
                  )
                }
                placeholder="Add notes..."
              />
            ) : (
              <p className="notes-view">{trip.notes[0] || "No notes added."}</p>
            )}
          </article>
        </section>

        <aside className="trip-sidebar">
          <h2 className="sidebar-title">Trip checklist</h2>
          <article className="sidebar-card">
            <div className="progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-label">
              {completedTasks} of {checklist.length} tasks done
            </p>
            <div className="checklist">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setChecklist((current) =>
                      current.map((candidate) =>
                        candidate.id === item.id
                          ? { ...candidate, done: !candidate.done }
                          : candidate,
                      ),
                    )
                  }
                >
                  <span className={`check-box ${item.done ? "done" : ""}`}>
                    {item.done && <FaCheck />}
                  </span>
                  <span className={item.done ? "done-label" : ""}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </article>

          <h2 className="sidebar-title">Travelers</h2>
          <article className="sidebar-card">
            <div className="traveler-row">
              <div className="traveler-avatar owner">YO</div>
              <div>
                <strong>You</strong>
                <span>Trip owner</span>
              </div>
            </div>

           {travelerProfiles.map((profile) => {
  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();

  return (
    <div
      className="traveler-row"
      key={profile.profileId}
    >
      <div className="traveler-avatar">
        {`${profile.firstName?.[0] ?? ""}${
          profile.lastName?.[0] ?? ""
        }`.toUpperCase()}
      </div>

      <div className="traveler-info">
        <strong>{fullName || profile.email}</strong>
        <span>{profile.email}</span>
      </div>

      {editing && (
        <button
          className="remove-traveler"
          onClick={() =>
            removeTraveler(profile.profileId)
          }
        >
          ×
        </button>
      )}
    </div>
  );
})}

            {editing && (
              <div className="invite-row">
                <input
                  type="email"
                  value={travelerEmail}
                  placeholder="Add email address"
                  onChange={(event) => setTravelerEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTraveler();
                    }
                  }}
                />
                <button onClick={addTraveler}>Invite</button>
              </div>
            )}
          </article>
        </aside>
      </main>
    </div>
  );
}
