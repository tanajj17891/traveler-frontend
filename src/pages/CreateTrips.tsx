import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaStickyNote,
  FaPlus,
  FaTrash,
  FaPlane,
} from "react-icons/fa";
import {
  createTrip,
  type CreateTripRequest,
  type Destination,
} from "../api/tripsAPI";
import {
  getLocationSuggestions,
  getPlaceDetails,
  type LocationSuggestion,
} from "../api/locationAPI";
import "./CreateTrips.css";

type BudgetForm = {
  currency: string;
  total: string;
  flights: string;
  accommodation: string;
  food: string;
  activities: string;
  misc: string;
};

/* type DestinationOption = {

  label: string;
  latitude: number;
  longitude: number;

}; */



const BUDGET_CATEGORIES = [
  "flights",
  "accommodation",
  "food",
  "activities",
  "misc",
] as const;

function toNum(value: string): number {
  //tonum accepts a string but promises to return a number
  const n = parseFloat(value); //extracts numeric characters from the string and turns them into a decimal
  return isNaN(n) ? 0 : n; // checks if conversion failed
}

function capitalize(str: string): string {
  //capitalises a string thats it
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const EMPTY_DESTINATION: Destination = {
  // shows empty destination before user picks anything
  name: "",
  latitude: 0,
  longitude: 0,
  arrivalDate: "",
  leaveDate: "",
};

export default function CreateTrips() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); //foguires out which step user is in
  const [isCreating, setIsCreating] =
    useState(false); /* A loading spinner flag. It switches to true when the 
  user submits the final form, preventing them from accidentally double-clicking the submit button while the API saves the data. */

  const [tripName, setTripName] = useState(""); //holds the trip names and other strings when user is typoing
  const [destinations, setDestinations] = useState<Destination[]>([
    { ...EMPTY_DESTINATION },
  ]);

const [locationSuggestions, setLocationSuggestions] = useState<
  Record<number, LocationSuggestion[]>
>({});

const [searchingLocation, setSearchingLocation] = useState<
  Record<number, boolean>
>({});

const searchTimers = useRef<Record<number, number>>({}); //keeps track of all active timers 
  const [budget, setBudget] = useState<BudgetForm>({
    currency: "USD",
    total: "",
    flights: "",
    accommodation: "",
    food: "",
    activities: "",
    misc: "",
  });

  const [notes, setNotes] = useState("");

  const addDestination = () => {
    // Appends a new, independent empty destination object to the state array.
    setDestinations((prev) => [...prev, { ...EMPTY_DESTINATION }]);
  };

  const removeDestination = (index: number) => {
    // Don't erase everything.
    if (destinations.length === 1) return;
    setDestinations((prev) =>
      prev.filter((_, i) => i !== index),
    ); /* The filter line looks at my list, 
    finds the exact row number i clicked on (index), and throws it in the trash. It then keeps all the other rows exactly the same. */
  };

 

  const updateDestinationDate = (
    // Updates either the arrival or leaving date for a specific destination by its index.
    // Dynamically targets the specified date field while keeping all other destination properties unchanged.

    index: number,
    field: "arrivalDate" | "leaveDate",
    value: string,
  ) => {
    setDestinations((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };

  const getToday = () => {
    const today = new Date(); // gets current time
    const offset = today.getTimezoneOffset(); //converts timezones to local time
    const localToday = new Date(today.getTime() - offset * 60 * 1000); // does the calculation

    return localToday.toISOString().split("T")[0]; //seperates date from the time
  };

  const addOneDay = (date: string) => {
    const nextDay = new Date(`${date}T00:00:00`); // takes date and then shifts to the next calendar day
    nextDay.setDate(nextDay.getDate() + 1);

    return nextDay.toISOString().split("T")[0];
  };

  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerEmails, setTravelerEmails] = useState<string[]>([]);

  const addTravelerEmail = () => {
    const email = travelerEmail.trim();

    if (!email) return;

    setTravelerEmails((prev) => [...prev, email]);
    setTravelerEmail("");
  };

  const removeTravelerEmail = (email: string) => {
    setTravelerEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleBudgetChange = (field: keyof BudgetForm, value: string) => {
    setBudget((prev) => ({ ...prev, [field]: value }));
  };

  const budgetTotal = toNum(budget.total);
  const allocatedTotal = BUDGET_CATEGORIES.reduce(
    // Computes the total spending limit and sums up all itemized category costs using an array reduction.
    (sum, key) => sum + toNum(budget[key]), // goes through each box and takes in the number the user added and then adds it like a machione
    0,
  );
  const remainingBudget = budgetTotal - allocatedTotal;

  const handleCreateTrip = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const savedProfile = localStorage.getItem("profile");
    const profileId = savedProfile ? JSON.parse(savedProfile).profileId : null;
 

    if (!accessToken) {
      alert("Access token is missing.");
      return;
    }
    if (!profileId) {
      alert("Profile id is missing");
      return;
    }

    const payload: CreateTripRequest = {
      // Constructs the structured request payload by sanitizing inputs, casting budget numbers, and formatting to create a new trip.

      profileId,
      tripName: tripName || "New trip",
      destination: destinations,
      travelers: travelerEmails, // previously i did [traveleremails] which was creating an array of the array traveleremails hence the error of never finding that email in my backend , then i changed to this
      budget: {
        currency: budget.currency,
        total: toNum(budget.total),
        flights: toNum(budget.flights),
        accommodation: toNum(budget.accommodation),
        food: toNum(budget.food),
        activities: toNum(budget.activities),
        misc: toNum(budget.misc),
      },
      notes: notes ? [notes] : [],
      status: "PLANNING",
    };

    try {
      setIsCreating(true);
   
      await createTrip(payload, accessToken);
      alert("Trip created successfully!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Failed to create trip");
    } finally {
      setIsCreating(false);
    }
  };

  const namedDestinations = destinations.filter((d) => d.name.trim());

  const tripDateRange = (() => {
    // Computes a human-readable date range and total night count across all scheduled destinations.

    const arrivals = namedDestinations
      .map((d) => d.arrivalDate)
      .filter(Boolean)
      .sort();
    const departures = namedDestinations
      .map((d) => d.leaveDate)
      .filter(Boolean)
      .sort();
    if (!arrivals.length || !departures.length) return null;
    const from = new Date(arrivals[0]);
    const to = new Date(departures[departures.length - 1]);
    const nights = Math.round((to.getTime() - from.getTime()) / 86400000);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(from)} – ${fmt(to)}${nights > 0 ? ` · ${nights}n` : ""}`;
  })();

  const steps = [
    // Defines a read-only configuration array for rendering the timeline navigation steps and icons.
    { n: 1, label: "Destinations", icon: <FaMapMarkerAlt /> },
    { n: 2, label: "Travelers", icon: <FaUsers /> },
    { n: 3, label: "Budget", icon: <FaDollarSign /> },
    { n: 4, label: "Notes", icon: <FaStickyNote /> },
  ] as const;

  const handleLocationSearch = ( //when user starts to type this function gets called 
  index: number, //figures out which destination 
  value: string,
) => {
  // Update what appears inside the input.
  setDestinations((current) => //gets the current array and helps create a brand new one 
    current.map((destination, destinationIndex) =>
      destinationIndex === index
        ? { //Creates a new destrination object 
            ...destination, //copies the old properties so we dont lose starting and arrival date 
            name: value,
            latitude: 0, // we reset the coordinates once the user starts typing again bc we dont know what location they mean 
            longitude: 0,
          }
        : destination,
    ),
  );

  // Cancel the previous timer for this stop.
  window.clearTimeout(searchTimers.current[index]); //cancels pending api requests as the user is typong , also known as debouncing , when the user stops typoing for 350 ms thats when the api gets called 

  if (value.trim().length < 3) { // doesnt show suggestions if user has typed less than 3 characters 
    setLocationSuggestions((current) => ({
      ...current,
      [index]: [],
    }));

    return;
  }

  searchTimers.current[index] = window.setTimeout(
    async () => { // function will run after 200 ms
      const accessToken =
        localStorage.getItem("accessToken");

      if (!accessToken) return;

      try {
        setSearchingLocation((current) => ({
          ...current,
          [index]: true,
        }));

        const suggestions =
          await getLocationSuggestions( // where frontend calls my backend 
            value.trim(),
            accessToken,
          );

        setLocationSuggestions((current) => ({
          ...current,
          [index]: suggestions,
        }));
      } catch (error) {
        console.error(
          "Failed to load location suggestions:",
          error,
        );

        setLocationSuggestions((current) => ({
          ...current,
          [index]: [],
        }));
      } finally {
        setSearchingLocation((current) => ({
          ...current,
          [index]: false,
        }));
      }
    },
    200,
  );
};

const selectLocation = async ( // runs after user selects a suggestion from the dropdown 
  index: number,
  suggestion: LocationSuggestion,
) => {
  const accessToken =
    localStorage.getItem("accessToken");

  if (!accessToken) {
    alert("Please log in again.");
    return;
  }

  try {
    const place = await getPlaceDetails(
      suggestion.placeId, //what i got back from my autocomplete api 
      accessToken,
    );

    setDestinations((current) =>
      current.map((destination, destinationIndex) =>
        destinationIndex === index
          ? {
              ...destination,

              // Keep arrivalDate and leavingDate from
              // the existing destination.
              name:
                place.displayName?.text ||
                suggestion.name ||
                place.formattedAddress ||
                "",

              latitude:
                place.location?.latitude ?? 0,

              longitude:
                place.location?.longitude ?? 0,
            }
          : destination,
      ),
    );

    setLocationSuggestions((current) => ({
      ...current,
      [index]: [],
    }));
  } catch (error) {
    console.error(
      "Failed to load place details:",
      error,
    );
  }
};

  return (
    <main className="create-trip-page">
      <section className="create-trip-container">
        <div className="wizard-header">
          <h1>Plan a new trip</h1>
          <div className="steps-track">
            {steps.map(({ n, label, icon }) => (
              <button
                key={n}
                className={
                  step === n ? "step active" : step > n ? "step done" : "step"
                }
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="create-trip-grid">
          <section className="create-trip-form">
            {step === 1 && (
              <>
                <div className="trip-form-card">
                  <h2>Where are you going?</h2>
                  <p>Add one destination or build a multi-stop itinerary.</p>

                  <label className="form-label">Trip name</label>
                  <input
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Summer in Mexico"
                  />

                  <div className="section-subhead">
                    <label className="form-label">Destinations</label>
                    <button
                      type="button"
                      className="add-stop-icon"
                      onClick={addDestination}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {destinations.map((dest, index) => (
                    <div className="destination-card" key={index}>
                      <div className="destination-card-head">
                        <strong>Stop {index + 1}</strong>
                      </div>

                      <label>Destination</label>

                     <div className="location-autocomplete">
  <input
    type="text"
    value={dest.name}
    placeholder="Search for a destination"
    autoComplete="off"
    onChange={(event) =>
      handleLocationSearch(
        index,
        event.target.value,
      )
    }
  />

  {searchingLocation[index] && (
    <div className="location-search-message">
      Searching...
    </div>
  )}

  {(locationSuggestions[index]?.length ?? 0) >
    0 && (
    <div className="location-suggestion-list">
      {locationSuggestions[index].map(
        (suggestion) => (
          <button
            type="button"
            className="location-suggestion-item"
            key={suggestion.placeId}
            onClick={() =>
              selectLocation(index, suggestion)
            }
          >
            {suggestion.name}
          </button>
        ),
      )}
    </div>
  )}
</div>

                      <div className="two-column">
                        <div>
                          <label>Arriving</label>
                          <input
                            type="date"
                            value={dest.arrivalDate}
                            min={
                              index === 0 // tells me which stop i am rendering
                                ? getToday()
                                : destinations[index - 1].leaveDate // if not the first stop, code lookjs at the previous stop to check when u are scheduled to leave it
                                  ? addOneDay(
                                      destinations[index - 1].leaveDate,
                                    )
                                  : getToday()
                            }
                            disabled={
                              index > 0 && !destinations[index - 1].leaveDate
                            } // doesnt let users check for stop 3 or 2 unless they have filled out stop 1 
                            onChange={(e) =>
                              updateDestinationDate(
                                index,
                                "arrivalDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label>Leaving</label>
                          <input
                            type="date"
                            value={dest.leaveDate}
                            min={dest.arrivalDate || getToday()}
                              disabled={!dest.arrivalDate}
                            onChange={(e) =>
                              updateDestinationDate(
                                index,
                                "leaveDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="destination-delete">
                        <button
                          type="button"
                          className="add-stop-icon"
                          onClick={() => removeDestination(index)}
                          aria-label={`Remove stop ${index + 1}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="step-actions right">
                  <button className="primary-btn" onClick={() => setStep(2)}>
                    Travelers
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="trip-form-card">
                  <h2>Who's coming?</h2>
                  <p>Add traveler emails for people joining this trip.</p>

                  <label>Traveler email</label>

                  <div className="inline-input">
                    <input
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTravelerEmail();
                        }
                      }}
                      placeholder="Enter traveler email"
                    />

                    <button type="button" onClick={addTravelerEmail}>
                      Add
                    </button>
                  </div>

                  <div className="traveler-list">
                    {travelerEmails.length === 0 ? (
                      <p className="empty-text">
                        No extra travelers added yet.
                      </p>
                    ) : (
                      travelerEmails.map((email) => (
                        <span className="traveler-chip" key={email}>
                          {email}
                          <button
                            type="button"
                            onClick={() => removeTravelerEmail(email)}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="step-actions">
                  <button className="ghost-btn" onClick={() => setStep(1)}>
                    Back
                  </button>

                  <button className="primary-btn" onClick={() => setStep(3)}>
                    Budget
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="trip-form-card">
                  <h2>What's your budget?</h2>
                  <p>Set a total budget and split it by category.</p>

                  <label>Currency</label>
                  <select
                    value={budget.currency}
                    onChange={(e) =>
                      handleBudgetChange("currency", e.target.value)
                    }
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>

                  <label>Total budget</label>
                  <input
                    type="number"
                    value={budget.total}
                    onChange={(e) =>
                      handleBudgetChange("total", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                  />

                  <div className="budget-grid">
                    {BUDGET_CATEGORIES.map((field) => (
                      <div key={field}>
                        <label>{capitalize(field)}</label>
                        <input
                          type="number"
                          value={budget[field]}
                          onChange={(e) =>
                            handleBudgetChange(field, e.target.value)
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>

                  <p
                    className={
                      remainingBudget < 0
                        ? "budget-status over"
                        : "budget-status"
                    }
                  >
                    {budgetTotal > 0
                      ? remainingBudget < 0
                        ? `${budget.currency} ${Math.abs(remainingBudget).toLocaleString()} over budget`
                        : remainingBudget === 0
                          ? "Fully allocated"
                          : `${budget.currency} ${remainingBudget.toLocaleString()} left to allocate`
                      : "Enter a total budget to track remaining amount."}
                  </p>
                </div>

                <div className="step-actions">
                  <button className="ghost-btn" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button className="primary-btn" onClick={() => setStep(4)}>
                    Notes
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="trip-form-card">
                  <h2>Notes</h2>
                  <p>
                    Add anything worth remembering — visa requirements,
                    restaurants, insurance, or reminders. You can plan out each
                    day in detail once the trip is created.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Check visa requirements, book hotel, research restaurants..."
                  />
                </div>

                <div className="step-actions">
                  <button className="ghost-btn" onClick={() => setStep(3)}>
                    Back
                  </button>
                  <button
                    className="primary-btn success"
                    onClick={handleCreateTrip}
                    disabled={isCreating}
                  >
                    <FaPlane />
                    {isCreating ? "Creating..." : "Create trip"}
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className="trip-summary-card">
            <div className="summary-hero">
              <span>Your trip</span>
              <h2>{tripName || "Name your trip"}</h2>
              <p>
                {namedDestinations.map((d) => d.name).join(" → ") ||
                  "Add destinations to see your route"}
              </p>
            </div>

            <div className="summary-body">
              <div>
                <small>Dates</small>
                <strong>{tripDateRange ?? "Not set"}</strong>
              </div>
              <div>
                <small>Destinations</small>
                <strong>
                  {namedDestinations.length > 0
                    ? namedDestinations.length
                    : "Not set"}
                </strong>
              </div>
              <div>
                <small>Travelers</small>
                <strong>{1 + travelerEmails.length}</strong>
              </div>
              <div>
                <small>Budget</small>
                <strong>
                  {budgetTotal > 0
                    ? `${budget.currency} ${budgetTotal.toLocaleString()}`
                    : "Not set"}
                </strong>
              </div>
              <div>
                <small>Status</small>
                <strong>Planning</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
