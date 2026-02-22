const axios = require("axios");

exports.getCyberNews = async (req, res) => {
  try {
    const topStories = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    const ids = topStories.data.slice(0, 5);

    const stories = await Promise.all(
      ids.map(id =>
        axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        )
      )
    );

    const formatted = stories.map(s => ({
      title: s.data.title,
      url: s.data.url
    }));

    res.json(formatted);

  } catch (error) {
    console.error("HN Error:", error.message);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};