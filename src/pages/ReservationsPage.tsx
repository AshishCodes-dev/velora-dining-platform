import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../services/api';
import { useRestaurant } from '../context/RestaurantContext';
import type { Reservation } from '../types/restaurant';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { pageTransitionVariants } from '../lib/motion';

interface TimeSlot {
  time: string;
  available: boolean;
  remainingTables: number;
}

export const ReservationsPage: React.FC = () => {
  const { user, showToast, refreshNotifications } = useRestaurant();

  const [name, setName] = useState(user?.name || 'Elena Rostova');
  const [phone, setPhone] = useState(user?.phone || '+1 (415) 602-8819');
  const [email, setEmail] = useState(user?.email || 'elena@example.com');
  const [date, setDate] = useState('2026-10-09');
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [tableArea, setTableArea] = useState<Reservation['tableArea']>('Velvet Chef Counter');
  const [specialRequest, setSpecialRequest] = useState('');

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedRes, setConfirmedRes] = useState<Reservation | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [user]);

  const loadSlots = async (selectedDate: string) => {
    try {
      setLoadingSlots(true);
      const res = await apiRequest<{ date: string; slots: TimeSlot[] }>(
        `/api/reservations/slots?date=${encodeURIComponent(selectedDate)}`
      );
      setSlots(res.slots);
    } catch {
      // fallback slots
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadMyReservations = async () => {
    try {
      setLoadingList(true);
      const res = await apiRequest<{ reservations: Reservation[] }>('/api/reservations');
      setReservations(res.reservations);
    } catch {
      // silent
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSlots(date);
  }, [date]);

  useEffect(() => {
    loadMyReservations();
  }, [user]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !time) {
      showToast('✕ Please complete all required reservation fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest<{ reservation: Reservation }>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          email,
          date,
          time,
          guests,
          tableArea,
          specialRequest,
        }),
      });
      setConfirmedRes(res.reservation);
      showToast('✓ Reservation confirmed', 'success');
      await loadSlots(date);
      await loadMyReservations();
      await refreshNotifications();
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await apiRequest(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      showToast('✓ Reservation cancelled', 'info');
      await loadMyReservations();
      await loadSlots(date);
    } catch {
      showToast('✕ Could not cancel reservation', 'error');
    }
  };

  const upcomingReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'REJECTED'
  );

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-14"
    >
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-yellow font-medium">
            VELORA · Concierge &amp; Private Dining
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-text mt-1">
            Table &amp; Sommelier Vault Reservations
          </h1>
        </div>
        <p className="text-xs text-text-soft font-mono-tabular">
          Instant Seat Confirmation · Parties of 1 to 20 Guests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Reservation Form OR Confirmation Receipt */}
        <div className="lg:col-span-7">
          {confirmedRes ? (
            <div className="nocturne-surface rounded-2xl p-8 space-y-6 border border-green-light/40">
              <div className="flex items-center gap-3 text-green-light">
                <CheckCircle2 className="w-7 h-7" />
                <div>
                  <p className="text-xs font-mono-tabular uppercase">
                    Reservation Code #{confirmedRes.reservationCode}
                  </p>
                  <h2 className="font-serif-display text-3xl font-semibold text-text">
                    Your Table is Reserved
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-soft leading-relaxed">
                We look forward to welcoming you to VELORA. Our Maître D’ has reserved your seating with a 15-minute grace period.
              </p>

              <div className="p-5 rounded-xl bg-canvas border border-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block">Guest Name</span>
                  <span className="font-semibold text-text mt-0.5 block">
                    {confirmedRes.name}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Date &amp; Time</span>
                  <span className="font-mono-tabular font-semibold text-yellow mt-0.5 block">
                    {confirmedRes.date} · {confirmedRes.time}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Party Size</span>
                  <span className="font-mono-tabular font-semibold text-green-light mt-0.5 block">
                    {confirmedRes.guests} Guests
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-border">
                  <span className="text-text-muted block">Dining Area</span>
                  <span className="font-semibold text-yellow mt-0.5 block">
                    {confirmedRes.tableArea}
                  </span>
                  {confirmedRes.specialRequest && (
                    <p className="text-text-soft mt-1">
                      Note: "{confirmedRes.specialRequest}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setConfirmedRes(null)}
                >
                  Make Another Reservation
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleReserve}
              className="nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <h2 className="font-serif-display text-2xl font-semibold text-text">
                Reserve Your Evening Seating
              </h2>

              {/* Date, Guests, Dining Room Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-yellow" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-green-light" />
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    Sanctuary Seating Area
                  </label>
                  <select
                    value={tableArea}
                    onChange={(e) =>
                      setTableArea(e.target.value as Reservation['tableArea'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  >
                    <option value="Velvet Chef Counter">Velvet Chef Counter</option>
                    <option value="Main Dining Room">Main Dining Room</option>
                    <option value="Velora Garden Terrace">Velora Garden Terrace</option>
                    <option value="Private Sommelier Vault">Private Sommelier Vault</option>
                  </select>
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-soft">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-yellow" />
                    Available Evening Time Slots ({date})
                  </label>
                  {loadingSlots && (
                    <span className="text-[11px] text-text-muted">Checking availability...</span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {slots.map((slot) => {
                    const selected = time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTime(slot.time)}
                        className={`p-2.5 rounded-xl border text-center font-mono-tabular transition-[background-color,border-color,color] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer ${
                          !slot.available
                            ? 'bg-canvas/40 border-border text-text-muted line-through opacity-50 cursor-not-allowed pointer-events-none'
                            : selected
                            ? 'bg-yellow border-yellow text-black font-semibold'
                            : 'bg-canvas border-border text-text hover:border-yellow/50'
                        }`}
                      >
                        <span className="text-xs block">{slot.time}</span>
                        <span className="text-[10px] opacity-75 block">
                          {slot.remainingTables} left
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Special Request */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                  Special Request (Dietary Restrictions, Celebration, Sommelier Pairing)
                </label>
                <textarea
                  rows={2}
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="e.g., Anniversary table styling, gluten-free tasting menu, quiet corner booth..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
              </div>

              <Button
                type="submit"
                variant="success"
                size="lg"
                fullWidth
                loading={submitting}
              >
                Confirm Table Reservation ({date} at {time})
              </Button>
            </form>
          )}
        </div>

        {/* Right Column: Upcoming & Past Reservations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="nocturne-surface rounded-2xl p-6 space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Upcoming Reservations ({upcomingReservations.length})
            </h2>

            {loadingList ? (
              <div className="space-y-3">
                <Skeleton variant="rectangular" className="h-24 w-full" />
                <Skeleton variant="rectangular" className="h-24 w-full" />
              </div>
            ) : upcomingReservations.length === 0 ? (
              <p className="text-xs text-text-muted py-4">
                No upcoming reservations yet. Select a date and time slot on the left to book your table.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-canvas border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-xs font-bold text-yellow">
                        #{res.reservationCode} · {res.date} at {res.time}
                      </span>
                      <span className="text-xs font-semibold text-green-light">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text">
                      {res.tableArea} · {res.guests} Guests ({res.name})
                    </p>
                    {res.specialRequest && (
                      <p className="text-[11px] text-text-soft">"{res.specialRequest}"</p>
                    )}
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelReservation(res.id)}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="text-xs py-1"
                      >
                        Cancel Reservation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nocturne-surface rounded-2xl p-6 space-y-4">
            <h2 className="font-serif-display text-xl font-semibold text-text">
              Past &amp; Cancelled Reservations ({pastReservations.length})
            </h2>
            {pastReservations.length === 0 ? (
              <p className="text-xs text-text-muted">No past reservations recorded.</p>
            ) : (
              <div className="space-y-3">
                {pastReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-canvas/60 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-text-soft">
                        #{res.reservationCode} · {res.tableArea}
                      </p>
                      <p className="font-mono-tabular text-[11px] text-text-muted">
                        {res.date} at {res.time} · {res.guests} Guests
                      </p>
                    </div>
                    <span className="font-mono-tabular text-[11px] text-text-muted">
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
