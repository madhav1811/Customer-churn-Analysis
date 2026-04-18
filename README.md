# Customer Churn Analysis

A comprehensive full-stack data analysis project for predicting customer churn using machine learning, featuring a React frontend for interactive dashboards and a Flask backend for model serving.

## 🚀 Features

- **Data Analysis & Modeling**: Machine learning pipeline for churn prediction using Random Forest
- **Interactive Dashboard**: Real-time visualizations and analytics
- **Prediction API**: RESTful API for churn predictions
- **User Authentication**: Secure login system
- **Risk Assessment**: Visual risk gauges and factor impact analysis
- **Docker Deployment**: Containerized backend and frontend for easy deployment

## 🛠 Tech Stack

### Backend
- **Python 3.9+**
- **Flask** - Web framework
- **Scikit-learn** - Machine learning
- **Joblib** - Model serialization
- **SQLite** - Database
- **Docker** - Containerization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling
- **Docker** - Containerization

### Data Analysis
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Matplotlib/Seaborn** - Data visualization
- **Scikit-learn** - ML algorithms

## 📊 Dataset

The project uses the Telco Customer Churn dataset from Kaggle, containing:
- 7,043 customer records
- 21 features including demographics, services, and billing information
- Target variable: Churn (Yes/No)

## 🏗 Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/madhav1811/Customer-churn-Analysis.git
   cd Customer-churn-Analysis
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py  # Train the model
python app.py    # Start the server
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📈 Usage

### Training the Model
```bash
cd backend
python train.py
```
This will:
- Load and preprocess the Telco customer data
- Train a Random Forest classifier
- Save the model and preprocessing artifacts

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Predictions
- `POST /api/predict` - Get churn prediction for customer data
- `GET /api/stats` - Get churn statistics

#### Data Analysis
- `GET /api/factors` - Get feature importance
- `GET /api/charts` - Get chart data

### Example API Usage
```python
import requests

# Login
response = requests.post('http://localhost:5000/api/auth/login',
                        json={'username': 'user', 'password': 'pass'})
token = response.json()['token']

# Make prediction
headers = {'Authorization': f'Bearer {token}'}
data = {
    'tenure': 12,
    'MonthlyCharges': 50.0,
    'Contract': 'Month-to-month',
    # ... other features
}
prediction = requests.post('http://localhost:5000/api/predict',
                          json=data, headers=headers)
```

## 🔍 Data Analysis Pipeline

1. **Data Exploration**: Initial analysis of customer demographics and churn patterns
2. **Preprocessing**: Feature engineering, encoding categorical variables, scaling
3. **Model Training**: Random Forest classifier with hyperparameter tuning
4. **Evaluation**: Model performance metrics and validation
5. **Deployment**: Model serving via Flask API

### Key Insights
- Contract type significantly impacts churn risk
- Monthly charges correlate with churn probability
- Tenure length shows inverse relationship with churn

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.yml up --build
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Model Validation
```bash
cd backend
python test_model.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Telco Customer Churn dataset from [Kaggle](https://www.kaggle.com/blastchar/telco-customer-churn)
- Icons from [Heroicons](https://heroicons.com/)
- UI components inspired by modern dashboard designs

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Note**: This project is for educational and demonstration purposes. For production use, additional security measures and performance optimizations should be implemented.