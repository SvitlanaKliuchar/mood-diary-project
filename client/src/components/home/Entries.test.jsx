import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Entries from "./Entries";
import { AuthContext } from "../../contexts/AuthContext";
import { EntriesContext } from "../../contexts/EntriesContext";
import { LoadingContext } from "../../contexts/LoadingContext";
import * as reactRouterDom from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../gen-art/NotificationModal", () => ({
  default: vi.fn(({ isOpen, onClose, title, message, actionText, onAction }) =>
    isOpen ? (
      <div data-testid="notification-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} data-testid="close-notification">
          Close
        </button>
        <button onClick={onAction} data-testid="action-button">
          {actionText}
        </button>
      </div>
    ) : null,
  ),
}));

global.LoadingSpinner = vi.fn(({ delay }) => (
  <div data-testid="loading-spinner">Loading...</div>
));

vi.mock("../loading/LoadingSpinner", () => ({
  default: vi.fn(({ delay }) => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));

vi.mock("./Home.module.css", () => ({
  default: {
    wrapper: "mock-wrapper",
    error: "mock-error",
    "all-entries-container": "mock-all-entries-container",
    "entry-container": "mock-entry-container",
    mood: "mock-mood",
    emoji: "mock-emoji",
    "date-time": "mock-date-time",
    date: "mock-date",
    time: "mock-time",
    "mood-tags": "mock-mood-tags",
    "mood-tag": "mock-mood-tag",
    "update-delete-container": "mock-update-delete-container",
    "update-btn": "mock-update-btn",
    "delete-btn": "mock-delete-btn",
    "no-entries": "mock-no-entries",
    "first-entry-indicator": "mock-first-entry-indicator",
  },
}));

vi.mock("../../data/moods.js", () => ({
  default: [
    { value: "great", iconUrl: "/mock-path/great.svg", name: "Great" },
    { value: "good", iconUrl: "/mock-path/good.svg", name: "Good" },
    { value: "meh", iconUrl: "/mock-path/meh.svg", name: "Meh" },
    { value: "bad", iconUrl: "/mock-path/bad.svg", name: "Bad" },
    { value: "awful", iconUrl: "/mock-path/awful.svg", name: "Awful" },
  ],
}));

describe("Entries Component", () => {
  const mockNavigate = vi.fn();

  const mockAuthContext = {
    user: { id: "user123", name: "Test User" },
    loading: false,
  };

  const mockLoadingContext = {
    startLoading: vi.fn(),
    finishLoading: vi.fn(),
    loadingCount: 0,
  };

  const mockRefreshEntries = vi.fn().mockResolvedValue();
  const mockDeleteEntry = vi.fn().mockResolvedValue();
  const mockUpdateEntry = vi.fn().mockResolvedValue();

  const mockEntriesContext = {
    entries: [],
    refreshEntries: mockRefreshEntries,
    displayedDate: new Date(),
    updateEntry: mockUpdateEntry,
    deleteEntry: mockDeleteEntry,
  };

  const originalLocalStorage = global.localStorage;
  let mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = mockLocalStorage;
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  const renderComponent = (
    authContextOverrides = {},
    entriesContextOverrides = {},
    loadingContextOverrides = {},
  ) => {
    const authContextValue = { ...mockAuthContext, ...authContextOverrides };
    const entriesContextValue = {
      ...mockEntriesContext,
      ...entriesContextOverrides,
    };
    const loadingContextValue = {
      ...mockLoadingContext,
      ...loadingContextOverrides,
    };

    return render(
      <AuthContext.Provider value={authContextValue}>
        <EntriesContext.Provider value={entriesContextValue}>
          <LoadingContext.Provider value={loadingContextValue}>
            <Entries />
          </LoadingContext.Provider>
        </EntriesContext.Provider>
      </AuthContext.Provider>,
    );
  };

  describe("Data Fetching", () => {
    it("fetches entries on mount when user is authenticated", async () => {
      renderComponent();
      await waitFor(() => {
        expect(mockLoadingContext.startLoading).toHaveBeenCalled();
        expect(mockRefreshEntries).toHaveBeenCalled();
        expect(mockLoadingContext.finishLoading).toHaveBeenCalled();
      });
    });

    it("does not fetch entries when user is loading", () => {
      renderComponent({ loading: true });
      expect(mockRefreshEntries).not.toHaveBeenCalled();
    });

    it("does not fetch entries when user is not authenticated", () => {
      renderComponent({ user: null });
      expect(mockRefreshEntries).not.toHaveBeenCalled();
    });

    it("re-fetches entries when displayedDate changes", async () => {
      const { rerender } = renderComponent();
      await waitFor(() => {
        expect(mockRefreshEntries).toHaveBeenCalledTimes(1);
      });
      const newDate = new Date("2023-05-15");
      rerender(
        <AuthContext.Provider value={mockAuthContext}>
          <EntriesContext.Provider
            value={{ ...mockEntriesContext, displayedDate: newDate }}
          >
            <LoadingContext.Provider value={mockLoadingContext}>
              <Entries />
            </LoadingContext.Provider>
          </EntriesContext.Provider>
        </AuthContext.Provider>,
      );
      await waitFor(() => {
        expect(mockRefreshEntries).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error when fetch fails with server response", async () => {
      const fetchError = new Error("API Error");
      fetchError.response = { data: { message: "Server error message" } };
      mockRefreshEntries.mockRejectedValueOnce(fetchError);
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText("Server error message")).toBeInTheDocument();
      });
    });

    it("displays generic error when fetch fails with network error", async () => {
      const fetchError = new Error("Network Error");
      fetchError.request = {};
      mockRefreshEntries.mockRejectedValueOnce(fetchError);
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText("No response from server. Please try again later."),
        ).toBeInTheDocument();
      });
    });

    it("displays error when delete fails", async () => {
      mockDeleteEntry.mockRejectedValueOnce(new Error("Delete failed"));
      const mockEntries = [
        {
          id: 1,
          mood: "great",
          date: "2023-05-01T12:00:00Z",
          emotions: ["happy", "relaxed"],
          sleep: ["well-rested"],
          productivity: ["focused"],
        },
      ];
      renderComponent({}, { entries: mockEntries });
      const deleteButton = screen.getByLabelText("Delete Mood Entry");
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(mockDeleteEntry).toHaveBeenCalledWith(1);
        expect(screen.getByText("Failed to delete entry")).toBeInTheDocument();
      });
    });
  });

  describe("UI Rendering", () => {
    it("displays loading spinner when loading", () => {
      renderComponent({}, {}, { loadingCount: 1 });
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it('displays "no entries" message when no entries found', async () => {
      renderComponent();
      await waitFor(() => {
        expect(mockRefreshEntries).toHaveBeenCalled();
      });
      expect(screen.getByText("No entries found.")).toBeInTheDocument();
    });

    it("displays entries correctly", async () => {
      const mockEntries = [
        {
          id: 1,
          mood: "great",
          date: "2023-05-01T12:00:00Z",
          emotions: ["happy", "relaxed"],
          sleep: ["well-rested"],
          productivity: ["focused"],
        },
        {
          id: 2,
          mood: "bad",
          date: "2023-05-02T15:30:00Z",
          emotions: ["stressed"],
          sleep: ["tired"],
          productivity: [],
        },
      ];
      renderComponent({}, { entries: mockEntries });
      await waitFor(() => {
        expect(mockRefreshEntries).toHaveBeenCalled();
      });
      expect(screen.getByText("great")).toBeInTheDocument();
      expect(screen.getByText("bad")).toBeInTheDocument();
      expect(screen.getByText("happy")).toBeInTheDocument();
      expect(screen.getByText("relaxed")).toBeInTheDocument();
      expect(screen.getByText("well-rested")).toBeInTheDocument();
      expect(screen.getByText("focused")).toBeInTheDocument();
      expect(screen.getByText("stressed")).toBeInTheDocument();
      expect(screen.getByText("tired")).toBeInTheDocument();
      expect(screen.getByText("This was your first entry")).toBeInTheDocument();
    });

    it("formats date and time correctly", async () => {
      const originalDateToLocaleDateString = Date.prototype.toLocaleDateString;
      const originalDateToLocaleTimeString = Date.prototype.toLocaleTimeString;
      Date.prototype.toLocaleDateString = vi
        .fn()
        .mockImplementation(function (locale, options) {
          if (this.toISOString().includes("2023-05-01")) {
            return "May 1, 2023";
          }
          return "Unknown date";
        });
      Date.prototype.toLocaleTimeString = vi
        .fn()
        .mockImplementation(function (locale, options) {
          if (this.toISOString().includes("2023-05-01")) {
            return "12:00 PM";
          }
          return "Unknown time";
        });
      const mockEntries = [
        {
          id: 1,
          mood: "great",
          date: "2023-05-01T12:00:00Z",
          emotions: [],
        },
      ];
      renderComponent({}, { entries: mockEntries });
      expect(screen.getByText("May 1, 2023")).toBeInTheDocument();
      expect(screen.getByText("12:00 PM")).toBeInTheDocument();
      Date.prototype.toLocaleDateString = originalDateToLocaleDateString;
      Date.prototype.toLocaleTimeString = originalDateToLocaleTimeString;
    });
  });

  describe("User Interactions", () => {
    it("navigates to edit entry page when update button is clicked", async () => {
      const mockEntries = [
        {
          id: 1,
          mood: "great",
          date: "2023-05-01T12:00:00Z",
          emotions: [],
        },
      ];
      renderComponent({}, { entries: mockEntries });
      const updateButton = screen.getByLabelText("Update Mood Entry");
      fireEvent.click(updateButton);
      expect(mockNavigate).toHaveBeenCalledWith("/entry/1");
    });

    it("calls deleteEntry when delete button is clicked", async () => {
      const mockEntries = [
        {
          id: 1,
          mood: "great",
          date: "2023-05-01T12:00:00Z",
          emotions: [],
        },
      ];
      renderComponent({}, { entries: mockEntries });
      const deleteButton = screen.getByLabelText("Delete Mood Entry");
      fireEvent.click(deleteButton);
      expect(mockDeleteEntry).toHaveBeenCalledWith(1);
    });
  });

  describe("Notification Feature", () => {
    it("shows notification when entries count reaches 5", async () => {
      const mockEntries = Array(4)
        .fill()
        .map((_, i) => ({
          id: i + 1,
          mood: "great",
          date: `2023-05-0${i + 1}T12:00:00Z`,
          emotions: [],
        }));
      const { rerender } = renderComponent({}, { entries: mockEntries });
      expect(
        screen.queryByTestId("notification-modal"),
      ).not.toBeInTheDocument();
      const updatedEntries = [
        ...mockEntries,
        {
          id: 5,
          mood: "good",
          date: "2023-05-05T12:00:00Z",
          emotions: [],
        },
      ];
      rerender(
        <AuthContext.Provider value={mockAuthContext}>
          <EntriesContext.Provider
            value={{ ...mockEntriesContext, entries: updatedEntries }}
          >
            <LoadingContext.Provider value={mockLoadingContext}>
              <Entries />
            </LoadingContext.Provider>
          </EntriesContext.Provider>
        </AuthContext.Provider>,
      );
      expect(screen.getByTestId("notification-modal")).toBeInTheDocument();
      expect(screen.getByText("Art Generation Unlocked!")).toBeInTheDocument();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "artFeatureUnlockNotificationShown",
        "true",
      );
    });

    it("closes notification when close button is clicked", async () => {
      const mockEntries = Array(5)
        .fill()
        .map((_, i) => ({
          id: i + 1,
          mood: "great",
          date: `2023-05-0${i + 1}T12:00:00Z`,
          emotions: [],
        }));
      renderComponent({}, { entries: mockEntries });
      expect(screen.getByTestId("notification-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("close-notification"));
      await waitFor(() => {
        expect(
          screen.queryByTestId("notification-modal"),
        ).not.toBeInTheDocument();
      });
    });

    it("navigates to art feature when action button is clicked", async () => {
      const mockEntries = Array(5)
        .fill()
        .map((_, i) => ({
          id: i + 1,
          mood: "great",
          date: `2023-05-0${i + 1}T12:00:00Z`,
          emotions: [],
        }));
      renderComponent({}, { entries: mockEntries });
      expect(screen.getByTestId("notification-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("action-button"));
      expect(mockNavigate).toHaveBeenCalledWith("/stats#gen-art-section");
      await waitFor(() => {
        expect(
          screen.queryByTestId("notification-modal"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
