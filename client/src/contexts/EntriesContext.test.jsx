import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import React, { useContext } from "react";
import { EntriesContext, EntriesProvider } from "./EntriesContext";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../utils/axiosInstance";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axiosInstance);

const mockAuthContext = {
  user: { id: 1, username: "testuser" },
  loading: false,
};

const AuthContextWrapper = ({ children }) => (
  <AuthContext.Provider value={mockAuthContext}>
    {children}
  </AuthContext.Provider>
);

function TestConsumer() {
  const {
    entries,
    addEntry,
    refreshEntries,
    displayedDate,
    setDisplayedDate,
    updateEntry,
    deleteEntry,
  } = useContext(EntriesContext);

  return (
    <div>
      <p data-testid="entries-count">{entries.length}</p>
      <p data-testid="displayed-date">{displayedDate.toISOString()}</p>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} data-testid={`entry-${entry.id}`}>
            {entry.mood}
          </li>
        ))}
      </ul>
      <button
        data-testid="add-entry"
        onClick={() =>
          addEntry({
            id: 999,
            date: new Date(),
            mood: "great",
            emotions: ["happy"],
          })
        }
      >
        Add Entry
      </button>
      <button
        data-testid="change-date"
        onClick={() => setDisplayedDate(new Date(2023, 5, 15))}
      >
        Change Date
      </button>
      <button data-testid="refresh-entries" onClick={() => refreshEntries()}>
        Refresh Entries
      </button>
      <button
        data-testid="update-entry"
        onClick={() =>
          updateEntry(1, { mood: "updated", emotions: ["excited"] })
        }
      >
        Update Entry
      </button>
      <button data-testid="delete-entry" onClick={() => deleteEntry(1)}>
        Delete Entry
      </button>
    </div>
  );
}

describe("EntriesContext", () => {
  beforeEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockEntries = [
    {
      id: 1,
      date: new Date("2023-06-01").toISOString(),
      mood: "great",
      emotions: ["happy", "excited"],
    },
    {
      id: 2,
      date: new Date("2023-06-02").toISOString(),
      mood: "good",
      emotions: ["content"],
    },
  ];

  it("loads entries on mount when user exists", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    expect(screen.getByTestId("entry-1")).toHaveTextContent("great");
    expect(screen.getByTestId("entry-2")).toHaveTextContent("good");

    expect(mockAxios.history.get.length).toBe(1);
    expect(mockAxios.history.get[0].url).toBe("/moods");

    const params = new URLSearchParams(mockAxios.history.get[0].params);
    const startDate = new Date(params.get("start"));
    const endDate = new Date(params.get("end"));

    const today = new Date();
    expect(startDate.getFullYear()).toBe(today.getFullYear());
    expect(startDate.getMonth()).toBe(today.getMonth());
    expect(startDate.getDate()).toBe(1);

    expect(endDate.getFullYear()).toBe(
      today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
    );
    expect(endDate.getMonth()).toBe(
      today.getMonth() === 11 ? 0 : today.getMonth() + 1,
    );
    expect(endDate.getDate()).toBe(1);
  });

  it("refreshes entries when displayedDate changes", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    const juneEntries = [
      { id: 3, date: "2023-06-15", mood: "meh", emotions: ["bored"] },
      { id: 4, date: "2023-06-20", mood: "good", emotions: ["content"] },
    ];
    mockAxios.onGet("/moods").reply(200, juneEntries);

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("change-date"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("entry-3")).toBeInTheDocument();
    });

    expect(mockAxios.history.get.length).toBe(2);

    const params = new URLSearchParams(mockAxios.history.get[1].params);
    const startDate = new Date(params.get("start"));
    const endDate = new Date(params.get("end"));

    expect(startDate.getFullYear()).toBe(2023);
    expect(startDate.getMonth()).toBe(5);
    expect(startDate.getDate()).toBe(1);

    expect(endDate.getFullYear()).toBe(2023);
    expect(endDate.getMonth()).toBe(6);
    expect(endDate.getDate()).toBe(1);
  });

  it("adds a new entry to state with addEntry", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-entry"));
    });

    expect(screen.getByTestId("entries-count").textContent).toBe("3");
    expect(screen.getByTestId("entry-999")).toHaveTextContent("great");

    const entries = screen.getAllByTestId(/^entry-/);
    expect(entries[0]).toHaveAttribute("data-testid", "entry-999");
  });

  it("updates an existing entry with updateEntry", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    mockAxios.onPut("/moods/1").reply(200, {
      mood: {
        id: 1,
        date: new Date("2023-06-01").toISOString(),
        mood: "updated",
        emotions: ["excited"],
      },
    });

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entry-1")).toHaveTextContent("great");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("update-entry"));
    });

    expect(screen.getByTestId("entry-1")).toHaveTextContent("updated");

    expect(mockAxios.history.put.length).toBe(1);
    expect(mockAxios.history.put[0].url).toBe("/moods/1");
    expect(JSON.parse(mockAxios.history.put[0].data)).toEqual({
      mood: "updated",
      emotions: ["excited"],
    });
  });

  it("removes an entry with deleteEntry", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    mockAxios.onDelete("/moods/1").reply(200, { success: true });

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
      expect(screen.getByTestId("entry-1")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("delete-entry"));
    });

    expect(screen.getByTestId("entries-count").textContent).toBe("1");
    expect(screen.queryByTestId("entry-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("entry-2")).toBeInTheDocument();

    expect(mockAxios.history.delete.length).toBe(1);
    expect(mockAxios.history.delete[0].url).toBe("/moods/1");
  });

  it("handles API errors gracefully during refreshEntries", async () => {
    mockAxios.onGet("/moods").reply(500, { error: "Server error" });

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(screen.getByTestId("entries-count").textContent).toBe("0");
  });

  it("handles API errors during updateEntry", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    const errorHandler = vi.fn();
    window.addEventListener("unhandledrejection", errorHandler);

    mockAxios.onPut("/moods/1").reply(500, { error: "Server error" });

    let entriesContext;
    function CaptureContext() {
      entriesContext = useContext(EntriesContext);
      return null;
    }

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <CaptureContext />
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    const updatePromise = entriesContext.updateEntry(1, {
      mood: "updated",
      emotions: ["excited"],
    });

    await updatePromise.catch(() => {});

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to update entry: ",
        expect.anything(),
      );
    });

    expect(screen.getByTestId("entry-1")).toHaveTextContent("great");

    window.removeEventListener("unhandledrejection", errorHandler);
  });

  it("handles API errors during deleteEntry", async () => {
    mockAxios.onGet("/moods").reply(200, mockEntries);

    const errorHandler = vi.fn();
    window.addEventListener("unhandledrejection", errorHandler);

    mockAxios.onDelete("/moods/1").reply(500, { error: "Server error" });

    let entriesContext;
    function CaptureContext() {
      entriesContext = useContext(EntriesContext);
      return null;
    }

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <CaptureContext />
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    const deletePromise = entriesContext.deleteEntry(1);

    await deletePromise.catch(() => {});

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to delete entry: ",
        expect.anything(),
      );
    });

    expect(screen.getByTestId("entries-count").textContent).toBe("2");
    expect(screen.getByTestId("entry-1")).toBeInTheDocument();

    window.removeEventListener("unhandledrejection", errorHandler);
  });

  it("does not fetch entries if no user is logged in", async () => {
    const noUserAuthContext = {
      user: null,
      loading: false,
    };

    mockAxios.onGet("/moods").reply(200, mockEntries);

    render(
      <AuthContext.Provider value={noUserAuthContext}>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContext.Provider>,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockAxios.history.get.length).toBe(0);

    expect(screen.getByTestId("entries-count").textContent).toBe("0");
  });

  it("manually refreshes entries when requested", async () => {
    mockAxios.onGet("/moods").replyOnce(200, mockEntries);

    mockAxios.onGet("/moods").replyOnce(200, [
      {
        id: 5,
        date: new Date().toISOString(),
        mood: "refreshed",
        emotions: ["content"],
      },
      {
        id: 6,
        date: new Date().toISOString(),
        mood: "happy",
        emotions: ["excited"],
      },
    ]);

    render(
      <AuthContextWrapper>
        <EntriesProvider>
          <TestConsumer />
        </EntriesProvider>
      </AuthContextWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });

    mockAxios.resetHistory();

    await act(async () => {
      fireEvent.click(screen.getByTestId("refresh-entries"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("entries-count").textContent).toBe("2");
    });
    expect(mockAxios.history.get.length).toBe(1);

    expect(screen.getByTestId("entry-5")).toBeInTheDocument();
    expect(screen.getByTestId("entry-6")).toBeInTheDocument();
  });
});
