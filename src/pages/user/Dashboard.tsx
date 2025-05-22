import { FC, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, MapPin, Star, Filter, Plus, Compass, TrendingUp } from 'lucide-react';

const categories = ['All', 'Clubbing', 'Rave', 'Birthday', 'Wedding', 'Food', 'Sport', 'Meeting', 'Conference', 'Other'];

// Sample data - would typically come from an API in a real app
const trendingEvents = [
  { id: 1, title: 'Dance Night', date: 'May 3, 2025', category: 'Clubbing', location: 'Club Glow', attendees: 342 },
  { id: 2, title: 'Food Festival', date: 'May 5, 2025', category: 'Food', location: 'Central Park', attendees: 587 },
  { id: 3, title: 'Marathon', date: 'May 10, 2025', category: 'Sport', location: 'Downtown', attendees: 1203 },
];
const recommendedEvents = [
  { id: 4, title: 'Tech Conference', date: 'May 15, 2025', category: 'Conference', location: 'Tech Center', attendees: 658 },
  { id: 5, title: 'Art Expo', date: 'May 20, 2025', category: 'Other', location: 'Gallery One', attendees: 422 },
  { id: 6, title: 'Live Concert', date: 'May 25, 2025', category: 'Rave', location: 'Music Hall', attendees: 892 },
];
const upcomingNearYou = [
  { id: 7, title: 'Local Meetup', date: 'May 2, 2025', category: 'Meeting', location: 'Community Center', attendees: 64 },
  { id: 8, title: 'Neighborhood Cleanup', date: 'May 8, 2025', category: 'Other', location: 'Green Park', attendees: 128 },
];
const recentlyViewed = [
  { id: 9, title: 'Yoga Class', date: 'April 30, 2025', category: 'Sport', location: 'Yoga Studio', attendees: 32 },
  { id: 10, title: 'Photography Workshop', date: 'April 28, 2025', category: 'Other', location: 'Art Center', attendees: 45 },
];

// Event Card component for better reuse
interface EventCardProps {
  id: number;
  title: string;
  date: string;
  category: string;
  location?: string;
  attendees?: number;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
  linkTo?: string; // Added linkTo prop instead of wrapping in Link
}

const EventCard: FC<EventCardProps> = ({ 
  id, 
  title, 
  date, 
  category, 
  location, 
  attendees, 
  variant = 'default', 
  className = '',
  linkTo // Use linkTo for navigation
}) => {
  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Card className={`hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}>
        <div className="flex items-center p-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium truncate">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{date}</span>
            </div>
            {location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            )}
          </div>
          <Badge variant={category === 'Clubbing' || category === 'Rave' ? 'secondary' : 'outline'} className="ml-2">
            {category}
          </Badge>
        </div>
      </Card>
    );
  }
  
  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={`h-full hover:shadow-md hover:scale-105 transition-all duration-300 ${className}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <Badge variant="outline" size="sm">{category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default variant
  return (
    <Card className={`h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden ${className}`}>
      <div className="h-32 bg-gradient-purple relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          {category === 'Clubbing' && '🎧'}
          {category === 'Rave' && '🎵'}
          {category === 'Food' && '🍲'}
          {category === 'Sport' && '🏃‍♂️'}
          {category === 'Conference' && '🎤'}
          {category === 'Meeting' && '👥'}
          {category === 'Birthday' && '🎂'}
          {category === 'Wedding' && '💍'}
          {category === 'Other' && '🎭'}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={category === 'Clubbing' || category === 'Rave' ? 'secondary' : 'outline'}>
            {category}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{date}</span>
        </div>
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
        )}
        {attendees && (
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span>{attendees} attending</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link to={linkTo || `/events/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Dashboard: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filterEvents = <T extends { title: string; category: string }>(events: T[]) =>
    events
      .filter(ev => selectedCategory === 'All' || ev.category === selectedCategory)
      .filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Use useMemo to avoid unnecessary filtering on each render
  const filteredTrending = useMemo(() => filterEvents(trendingEvents), [searchTerm, selectedCategory]);
  const filteredRecommended = useMemo(() => filterEvents(recommendedEvents), [searchTerm, selectedCategory]);
  const filteredNearby = useMemo(() => filterEvents(upcomingNearYou), [searchTerm, selectedCategory]);
  const filteredViewed = useMemo(() => filterEvents(recentlyViewed), [searchTerm, selectedCategory]);

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setSearchTerm(value);
    // Simulate search delay
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleCategoryChange = (value: string) => {
    setIsLoading(true);
    setSelectedCategory(value);
    // Simulate filter delay
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative rounded-xl overflow-hidden group h-72 sm:h-80 lg:h-96">
        <div className="absolute inset-0 bg-mesh-gradient opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Discover Events</span>
          </h1>
          <p className="text-lg max-w-xl text-white/90">
            Find the perfect experiences that match your interests
          </p>
          <Button size="lg" className="mt-4 bg-white text-primary hover:bg-white/90">
            <Compass className="mr-2 h-4 w-4" />
            Explore Featured Event
          </Button>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2 px-2 pb-2">
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`py-1.5 px-3 cursor-pointer hover:bg-primary/90 transition-colors ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-background hover:text-primary-foreground'
              }`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </section>

      {/* Trending Events */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary h-5 w-5" />
          <h2 className="text-2xl font-semibold">Trending Events</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredTrending.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrending.map(ev => (
              // Now we pass the event directly to EventCard with linkTo prop instead of wrapping in Link
              <EventCard 
                key={ev.id} 
                {...ev} 
                linkTo={`/events/${ev.id}`} 
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No trending events match your criteria</p>
          </Card>
        )}
      </section>

      {/* Recommended for You */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRecommended.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommended.map(ev => (
              <EventCard 
                key={ev.id} 
                {...ev} 
                linkTo={`/events/${ev.id}`}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No recommended events match your criteria</p>
          </Card>
        )}
      </section>

      {/* Upcoming Near You */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Upcoming Events Near You</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNearby.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNearby.map(ev => (
              <Link key={ev.id} to={`/events/${ev.id}`}>
                <EventCard {...ev} variant="horizontal" />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No nearby events match your criteria</p>
          </Card>
        )}
      </section>

      {/* Recently Viewed */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recently Viewed</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {isLoading ? (
            [1, 2].map(i => (
              <div key={i} className="min-w-[240px]">
                <Card className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              </div>
            ))
          ) : filteredViewed.length > 0 ? (
            filteredViewed.map(ev => (
              <div key={ev.id} className="min-w-[240px] max-w-[280px]">
                <Link to={`/events/${ev.id}`}>
                  <EventCard {...ev} variant="compact" />
                </Link>
              </div>
            ))
          ) : (
            <Card className="p-6 text-center w-full">
              <p className="text-muted-foreground">No recently viewed events match your criteria</p>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="text-center pt-6">
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-opacity">
          <Link to="/new-event">
            <Plus className="mr-2 h-4 w-4" />
            Create Your Own Event
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default Dashboard;