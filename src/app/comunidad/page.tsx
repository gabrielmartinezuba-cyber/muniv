import { getUserBookings } from "@/actions/booking";
import UserDashboardClient from "./UserDashboardClient";

export default async function ClubDashboard() {
  const bookings = await getUserBookings();
  return <UserDashboardClient bookings={bookings} />;
}
