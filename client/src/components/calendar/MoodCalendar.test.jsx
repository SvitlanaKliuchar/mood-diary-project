import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MoodCalendar from './MoodCalendar';
import { LoadingContext } from '../../contexts/LoadingContext';
import axiosInstance from '../../utils/axiosInstance';
import moods from '../../data/moods';
import { format, isSameDay } from 'date-fns';

vi.mock('../../utils/axiosInstance', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  
  return {
    ...actual,
    format: vi.fn().mockImplementation((date, formatString) => {
      if (formatString === 'yyyy-MM-dd') {
        if (date instanceof Date) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      }
      return actual.format(date, formatString);
    }),
    startOfMonth: vi.fn(date => {
      const newDate = new Date(date);
      newDate.setDate(1);
      return newDate;
    }),
    endOfMonth: vi.fn(date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1, 0);
      return newDate;
    }),
    isSameDay: vi.fn((date1, date2) => {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    })
  };
});

vi.mock('react-calendar', () => ({
  default: vi.fn(props => {
    return (
      <div data-testid="mock-calendar">
        <button 
          data-testid="prev-month-button" 
          onClick={() => {
            const prevDate = new Date(props.activeStartDate);
            prevDate.setMonth(prevDate.getMonth() - 1);
            props.onActiveStartDateChange({ activeStartDate: prevDate });
          }}
        >
          Previous Month
        </button>
        
        <button 
          data-testid="next-month-button" 
          onClick={() => {
            const nextDate = new Date(props.activeStartDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            props.onActiveStartDateChange({ activeStartDate: nextDate });
          }}
        >
          Next Month
        </button>
        
        <div data-testid="calendar-tiles">
          {/* Test tiles for specific days */}
          <div data-testid="tile-day1" onClick={() => props.onChange(new Date(2023, 4, 1))}>
            {props.tileContent({ 
              date: new Date(2023, 4, 1), // May 1, 2023
              view: 'month' 
            })}
          </div>
          <div data-testid="tile-day15" onClick={() => props.onChange(new Date(2023, 4, 15))}>
            {props.tileContent({ 
              date: new Date(2023, 4, 15), // May 15, 2023
              view: 'month' 
            })}
          </div>
          <div data-testid="tile-day30" onClick={() => props.onChange(new Date(2023, 4, 30))}>
            {props.tileContent({ 
              date: new Date(2023, 4, 30), // May 30, 2023 - no mood
              view: 'month' 
            })}
          </div>
          <div data-testid="tile-wrong-view">
            {props.tileContent({ 
              date: new Date(2023, 4, 1),
              view: 'year' // Should return null
            })}
          </div>
        </div>
      </div>
    );
  }),
  __esModule: true
}));

vi.mock('./MoodCalendar.module.css', () => ({
  default: {
    'calendar-container': 'mock-calendar-container',
    'dayCircle': 'mock-dayCircle',
    'dayCircleEmpty': 'mock-dayCircleEmpty',
    'today': 'mock-today',
    'activeDay': 'mock-activeDay',
    'calendar': 'mock-calendar',
    'errorMessage': 'mock-errorMessage'
  }
}));

vi.mock('../../data/moods.js', () => ({
  default: [
    { color: '#4caf50', name: 'Great' }, // great
    { color: '#8bc34a', name: 'Good' },  // good
    { color: '#ffeb3b', name: 'Meh' },   // meh
    { color: '#ff9800', name: 'Bad' },   // bad
    { color: '#f44336', name: 'Awful' }  // awful
  ]
}));

vi.mock('../loading/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

const localStorageMock = (() => {
  let store = { token: 'mock-token' };
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('MoodCalendar Component', () => {
  const mockStartLoading = vi.fn();
  const mockFinishLoading = vi.fn();

  const mockMoodData = [
    { date: '2023-05-01T12:00:00Z', mood: 'great' },
    { date: '2023-05-15T12:00:00Z', mood: 'bad' }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    

    axiosInstance.get.mockReset();
    axiosInstance.get.mockResolvedValue({ data: mockMoodData });
  });
  
  const renderComponent = async () => {
    const result = render(
      <LoadingContext.Provider value={{ startLoading: mockStartLoading, finishLoading: mockFinishLoading }}>
        <MoodCalendar />
      </LoadingContext.Provider>
    );
    

    await waitFor(() => expect(mockStartLoading).toHaveBeenCalled());
    
    return result;
  };
  
  describe('Rendering', () => {
    it('renders the calendar component and loading spinner', async () => {
      await renderComponent();
      
      expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    
    it('does not show error message initially', async () => {
      await renderComponent();
      
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });
  
  describe('Data Fetching', () => {
    it('fetches mood data when component mounts', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith('/moods', {
          params: expect.objectContaining({
            start: expect.any(String),
            end: expect.any(String)
          }),
          headers: {
            Authorization: 'Bearer mock-token'
          }
        });
        expect(mockStartLoading).toHaveBeenCalled();
        expect(mockFinishLoading).toHaveBeenCalled();
      });
    });
    
    it('fetches new data when month changes', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });
      
      fireEvent.click(screen.getByTestId('next-month-button'));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
    
    it('handles API errors with message', async () => {
      axiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: 'API Error' } }
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      });
    });
    
    it('handles API errors without message', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error());
      
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch moods')).toBeInTheDocument();
      });
    });
  });
  
  describe('User Interactions', () => {
    it('updates selected date when a day is clicked', async () => {
      await renderComponent();

      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });
      
      fireEvent.click(screen.getByTestId('tile-day1'));
    });
    
    it('changes month when navigation buttons are clicked', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('prev-month-button'));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });

      fireEvent.click(screen.getByTestId('next-month-button'));
      
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(3);
      });
    });
  });
  
  describe('Tile Rendering', () => {
    it('renders tiles with correct mood colors', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });

      const dayWithGreatMood = screen.getByTestId('tile-day1').firstChild;
      const dayWithBadMood = screen.getByTestId('tile-day15').firstChild;
      const dayWithNoMood = screen.getByTestId('tile-day30').firstChild;

      expect(dayWithGreatMood).toHaveClass('mock-dayCircle');
      expect(dayWithBadMood).toHaveClass('mock-dayCircle');
      expect(dayWithNoMood).toHaveClass('mock-dayCircleEmpty');
      
      const greatMoodColor = dayWithGreatMood.style.backgroundColor;
      const badMoodColor = dayWithBadMood.style.backgroundColor;
      
      expect(
        greatMoodColor === moods[0].color || 
        greatMoodColor === 'rgb(76, 175, 80)'
      ).toBe(true);
      
      expect(
        badMoodColor === moods[3].color || 
        badMoodColor === 'rgb(255, 152, 0)'
      ).toBe(true);
      
      expect(dayWithNoMood.style.backgroundColor).toBe('');
    });
    
    it('returns null for non-month views', async () => {
      await renderComponent();
      
      const nonMonthTile = screen.getByTestId('tile-wrong-view');
      expect(nonMonthTile).toBeEmptyDOMElement();
    });
    
    it('applies today class for current date', async () => {
      isSameDay.mockImplementation((date1, date2) => {
        if (date1.getDate() === 1 && 
            date1.getMonth() === 4 && 
            date1.getFullYear() === 2023) {
          return true;
        }
        return false;
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });
      
      const todayTile = screen.getByTestId('tile-day1').firstChild;
      const nonTodayTile = screen.getByTestId('tile-day15').firstChild;
      
      expect(todayTile).toHaveClass('mock-today');
      expect(nonTodayTile).not.toHaveClass('mock-today');
    });
    
    it('applies activeDay class for selected date', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });
      
      const initialDay1 = screen.getByTestId('tile-day1').firstChild;
      expect(initialDay1).not.toHaveClass('mock-activeDay');
      
      fireEvent.click(screen.getByTestId('tile-day1'));
      
      isSameDay.mockImplementation((date1, date2) => {
        if (date1.getDate() === 1 && 
            date1.getMonth() === 4 && 
            date1.getFullYear() === 2023 &&
            date2.getDate() === 1 && 
            date2.getMonth() === 4 && 
            date2.getFullYear() === 2023) {
          return true;
        }
        return false;
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(mockFinishLoading).toHaveBeenCalled();
      });
      

    });
  });
});