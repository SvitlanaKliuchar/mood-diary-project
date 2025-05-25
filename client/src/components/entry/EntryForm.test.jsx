import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EntryForm from "./EntryForm";
import { EntriesContext } from "../../contexts/EntriesContext";
import { LoadingContext } from "../../contexts/LoadingContext";
import * as reactRouterDom from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

vi.mock("../../utils/axiosInstance.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  return {
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

vi.mock("./EntryMoodDate.jsx", () => ({
  default: vi.fn(({ date, setDate, mood, setMood }) => (
    <div data-testid="entry-mood-date">
      <input
        data-testid="date-input"
        type="date"
        value={date instanceof Date ? date.toISOString().split("T")[0] : ""}
        onChange={(e) => setDate(new Date(e.target.value))}
      />
      <select
        data-testid="mood-select"
        value={mood || ""}
        onChange={(e) => setMood(e.target.value)}
      >
        <option value="">Select mood</option>
        <option value="happy">Happy</option>
        <option value="sad">Sad</option>
      </select>
    </div>
  )),
}));

vi.mock("./EntryMain.jsx", () => ({
  default: vi.fn(
    ({
      emotions,
      setEmotions,
      sleep,
      setSleep,
      productivity,
      setProductivity,
      note,
      setNote,
      photo,
      setPhoto,
    }) => (
      <div data-testid="entry-main">
        <input
          data-testid="note-input"
          type="text"
          value={note || ""}
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          data-testid="photo-input"
          type="file"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
      </div>
    ),
  ),
}));

vi.mock("./form-elements/SubmitButton.jsx", () => ({
  default: () => (
    <button data-testid="submit-button" type="submit">
      Submit
    </button>
  ),
}));

describe("EntryForm Component", () => {
  const mockNavigate = vi.fn();
  const mockAddEntry = vi.fn();
  const mockUpdateEntry = vi.fn().mockResolvedValue({});
  const mockStartLoading = vi.fn();
  const mockFinishLoading = vi.fn();
  const mockEntries = [
    {
      id: 123,
      date: "2023-01-01T12:00:00Z",
      mood: "happy",
      emotions: ["joy"],
      sleep: ["good"],
      productivity: ["high"],
      note: "Test note",
    },
  ];

  const originalFormData = global.FormData;
  let mockFormDataAppend;

  beforeEach(() => {
    vi.clearAllMocks();
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    mockFormDataAppend = vi.fn();
    global.FormData = vi.fn(() => ({
      append: mockFormDataAppend,
      get: vi.fn((key) => {
        if (key === "photo" && formDataMockPhoto) {
          return formDataMockPhoto;
        }
        return null;
      }),
    }));
  });

  afterEach(() => {
    global.FormData = originalFormData;
  });

  let formDataMockPhoto = null;

  const renderComponent = (isEditing = false) => {
    reactRouterDom.useParams.mockReturnValue(
      isEditing ? { id: "123" } : { id: undefined },
    );

    return render(
      <EntriesContext.Provider
        value={{
          addEntry: mockAddEntry,
          updateEntry: mockUpdateEntry,
          entries: mockEntries,
        }}
      >
        <LoadingContext.Provider
          value={{
            startLoading: mockStartLoading,
            finishLoading: mockFinishLoading,
          }}
        >
          <EntryForm />
        </LoadingContext.Provider>
      </EntriesContext.Provider>,
    );
  };

  describe("Rendering", () => {
    it("renders the form correctly in creation mode", () => {
      renderComponent();
      expect(screen.getByTestId("entry-mood-date")).toBeInTheDocument();
      expect(screen.getByTestId("entry-main")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("loads existing entry data when editing", () => {
      renderComponent(true);
      expect(screen.getByTestId("mood-select")).toHaveValue("happy");
      expect(screen.getByTestId("note-input")).toHaveValue("Test note");
    });
  });

  describe("Validation", () => {
    it("shows validation error when form is submitted without required fields", async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(
          screen.getByText("Please select both date and mood."),
        ).toBeInTheDocument();
      });
      expect(mockStartLoading).toHaveBeenCalled();
      expect(mockFinishLoading).toHaveBeenCalled();
      expect(mockAddEntry).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission - Create Mode", () => {
    it("successfully submits a new entry", async () => {
      renderComponent();
      const mockResponseData = {
        mood: {
          id: 456,
          date: "2023-02-01T12:00:00Z",
          mood: "happy",
        },
      };
      axiosInstance.post.mockResolvedValueOnce({ data: mockResponseData });
      fireEvent.change(screen.getByTestId("mood-select"), {
        target: { value: "happy" },
      });
      fireEvent.change(screen.getByTestId("note-input"), {
        target: { value: "New test note" },
      });
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(mockStartLoading).toHaveBeenCalled();
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/moods",
          expect.objectContaining({
            append: expect.any(Function),
            get: expect.any(Function),
          }),
          expect.objectContaining({
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        );
        expect(mockAddEntry).toHaveBeenCalledWith(mockResponseData.mood);
        expect(mockFinishLoading).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
      expect(mockFormDataAppend).toHaveBeenCalledWith("mood", "happy");
      expect(mockFormDataAppend).toHaveBeenCalledWith("note", "New test note");
    });

    it("handles API error during submission", async () => {
      renderComponent();
      const errorMessage = "Server error";
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });
      fireEvent.change(screen.getByTestId("mood-select"), {
        target: { value: "happy" },
      });
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockFinishLoading).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles generic error during submission", async () => {
      renderComponent();
      axiosInstance.post.mockRejectedValueOnce(new Error("Network error"));
      fireEvent.change(screen.getByTestId("mood-select"), {
        target: { value: "happy" },
      });
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(
          screen.getByText("An error occured while submitting your entry"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission - Edit Mode", () => {
    it("successfully updates an existing entry", async () => {
      renderComponent(true);
      fireEvent.change(screen.getByTestId("note-input"), {
        target: { value: "Updated note" },
      });
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(mockUpdateEntry).toHaveBeenCalledWith(
          "123",
          expect.objectContaining({
            append: expect.any(Function),
            get: expect.any(Function),
          }),
        );
        expect(mockNavigate).toHaveBeenCalledWith("/home");
      });
      expect(mockFormDataAppend).toHaveBeenCalledWith("note", "Updated note");
    });
  });

  describe("File Handling", () => {
    it("handles file upload correctly", async () => {
      renderComponent();
      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      formDataMockPhoto = file;
      const fileInput = screen.getByTestId("photo-input");
      fireEvent.change(fileInput, { target: { files: [file] } });
      fireEvent.change(screen.getByTestId("mood-select"), {
        target: { value: "happy" },
      });
      fireEvent.click(screen.getByTestId("submit-button"));
      await waitFor(() => {
        expect(mockFormDataAppend).toHaveBeenCalledWith("photo", file);
      });
    });
  });
});
