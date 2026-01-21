export interface Event {
  _id: string;
  title: string;
  description: string;
  image: string | null;
  ticket_price: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  eventMode: string;
  visibility: boolean;
  isFeatured: boolean;
  createdAt: string;

  location?: {
    _id: string;
    city: string;
  };

  category?: {
    _id: string;
    name: string;
  };

  sub_category?: {
    _id: string;
    name: string;
  };
}
