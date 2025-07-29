# Array Handling

S7E provides comprehensive support for arrays of all types. This guide shows advanced patterns for working with arrays, collections, and list-based data structures.

## Arrays of Primitives

Working with arrays of basic types like strings, numbers, and booleans.

```typescript
import { S7e, JsonClass, JsonProperty } from 's7e';

@JsonClass({ name: 'DataCollection' })
class DataCollection {
  @JsonProperty({ name: 'tags', type: [String] })
  public tags: string[];

  @JsonProperty({ name: 'scores', type: [Number] })
  public scores: number[];

  @JsonProperty({ name: 'flags', type: [Boolean] })
  public flags: boolean[];

  @JsonProperty({ name: 'timestamps', type: [Date] })
  public timestamps: Date[];

  @JsonProperty({ name: 'metadata', type: [String], optional: true })
  public metadata?: string[];

  constructor() {
    this.tags = [];
    this.scores = [];
    this.flags = [];
    this.timestamps = [];
  }

  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  public addScore(score: number): void {
    this.scores.push(Math.max(0, Math.min(100, score))); // Clamp between 0-100
  }

  public addFlag(flag: boolean): void {
    this.flags.push(flag);
  }

  public addTimestamp(date?: Date): void {
    this.timestamps.push(date || new Date());
  }

  public getAverageScore(): number {
    if (this.scores.length === 0) return 0;
    return this.scores.reduce((sum, score) => sum + score, 0) / this.scores.length;
  }

  public getTrueFlags(): number {
    return this.flags.filter(flag => flag).length;
  }

  public getTagsCount(): Map<string, number> {
    const counts = new Map<string, number>();
    this.tags.forEach(tag => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
    return counts;
  }
}

// Usage example
const collection = new DataCollection();

// Add various data
collection.addTag('important');
collection.addTag('urgent');
collection.addTag('review');
collection.addTag('important'); // Duplicate, won't be added

collection.addScore(85);
collection.addScore(92);
collection.addScore(78);
collection.addScore(105); // Will be clamped to 100

collection.addFlag(true);
collection.addFlag(false);
collection.addFlag(true);

collection.addTimestamp(new Date('2025-01-01'));
collection.addTimestamp(new Date('2025-01-15'));
collection.addTimestamp(); // Current date

collection.metadata = ['version:1.0', 'author:system', 'type:analytics'];

console.log('Data Collection:');
console.log('Tags:', collection.tags);
console.log('Scores:', collection.scores);
console.log('Average Score:', collection.getAverageScore());
console.log('True Flags:', collection.getTrueFlags());
console.log('Timestamps:', collection.timestamps.map(d => d.toISOString()));

// Serialize and deserialize
const json = S7e.serialize(collection);
const restored = S7e.deserialize(DataCollection, json);

console.log('\\nAfter serialization/deserialization:');
console.log('Tags preserved:', JSON.stringify(restored.tags) === JSON.stringify(collection.tags));
console.log('Scores preserved:', JSON.stringify(restored.scores) === JSON.stringify(collection.scores));
console.log('Timestamps are Date objects:', restored.timestamps.every(t => t instanceof Date));
```

## Arrays of Objects

Complex arrays containing custom objects with nested relationships.

```typescript
@JsonClass({ name: 'Skill' })
class Skill {
  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'level', type: Number })
  public level: number; // 1-10

  @JsonProperty({ name: 'category', type: String })
  public category: string;

  @JsonProperty({ name: 'yearsExperience', type: Number })
  public yearsExperience: number;

  @JsonProperty({ name: 'certifications', type: [String] })
  public certifications: string[];

  constructor(name: string, level: number, category: string) {
    this.name = name;
    this.level = Math.max(1, Math.min(10, level));
    this.category = category;
    this.yearsExperience = 0;
    this.certifications = [];
  }

  public addCertification(cert: string): void {
    if (!this.certifications.includes(cert)) {
      this.certifications.push(cert);
    }
  }

  public isExpert(): boolean {
    return this.level >= 8;
  }

  public isBeginner(): boolean {
    return this.level <= 3;
  }
}

@JsonClass({ name: 'Project' })
class Project {
  @JsonProperty({ name: 'id', type: String })
  public id: string;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'description', type: String })
  public description: string;

  @JsonProperty({ name: 'technologies', type: [String] })
  public technologies: string[];

  @JsonProperty({ name: 'startDate', type: Date })
  public startDate: Date;

  @JsonProperty({ name: 'endDate', type: Date, optional: true })
  public endDate?: Date;

  @JsonProperty({ name: 'teamSize', type: Number })
  public teamSize: number;

  @JsonProperty({ name: 'budget', type: Number, optional: true })
  public budget?: number;

  @JsonProperty({ name: 'status', type: String })
  public status: string; // 'planning', 'active', 'completed', 'cancelled'

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.technologies = [];
    this.startDate = new Date();
    this.teamSize = 1;
    this.status = 'planning';
  }

  public addTechnology(tech: string): void {
    if (!this.technologies.includes(tech)) {
      this.technologies.push(tech);
    }
  }

  public getDurationInDays(): number {
    const end = this.endDate || new Date();
    return Math.ceil((end.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public complete(): void {
    this.status = 'completed';
    this.endDate = new Date();
  }
}

@JsonClass({ name: 'Developer' })
class Developer {
  @JsonProperty({ name: 'id', type: Number })
  public id: number;

  @JsonProperty({ name: 'name', type: String })
  public name: string;

  @JsonProperty({ name: 'email', type: String })
  public email: string;

  @JsonProperty({ name: 'skills', type: [Skill] })
  public skills: Skill[];

  @JsonProperty({ name: 'projects', type: [Project] })
  public projects: Project[];

  @JsonProperty({ name: 'currentProjects', type: [Project] })
  public currentProjects: Project[];

  @JsonProperty({ name: 'preferredTechnologies', type: [String] })
  public preferredTechnologies: string[];

  @JsonProperty({ name: 'availability', type: Number })
  public availability: number; // Percentage 0-100

  @JsonProperty({ name: 'hourlyRate', type: Number, optional: true })
  public hourlyRate?: number;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.skills = [];
    this.projects = [];
    this.currentProjects = [];
    this.preferredTechnologies = [];
    this.availability = 100;
  }

  public addSkill(skill: Skill): void {
    // Check if skill already exists, update if higher level
    const existingIndex = this.skills.findIndex(s => s.name === skill.name);
    if (existingIndex >= 0) {
      if (skill.level > this.skills[existingIndex].level) {
        this.skills[existingIndex] = skill;
      }
    } else {
      this.skills.push(skill);
    }
  }

  public addProject(project: Project): void {
    if (!this.projects.find(p => p.id === project.id)) {
      this.projects.push(project);
      if (project.isActive()) {
        this.currentProjects.push(project);
      }
    }
  }

  public getSkillsByCategory(category: string): Skill[] {
    return this.skills.filter(skill => skill.category === category);
  }

  public getExpertSkills(): Skill[] {
    return this.skills.filter(skill => skill.isExpert());
  }

  public getAverageSkillLevel(): number {
    if (this.skills.length === 0) return 0;
    return this.skills.reduce((sum, skill) => sum + skill.level, 0) / this.skills.length;
  }

  public getTotalProjectDuration(): number {
    return this.projects.reduce((total, project) => total + project.getDurationInDays(), 0);
  }

  public getProjectsByTechnology(tech: string): Project[] {
    return this.projects.filter(project => project.technologies.includes(tech));
  }

  public isAvailableForWork(): boolean {
    return this.availability > 0 && this.currentProjects.length < 3;
  }

  public updateAvailability(): void {
    const workload = this.currentProjects.length;
    if (workload === 0) {
      this.availability = 100;
    } else if (workload === 1) {
      this.availability = 50;
    } else if (workload === 2) {
      this.availability = 25;
    } else {
      this.availability = 0;
    }
  }
}

// Create developers with skills and projects
const developer1 = new Developer(1, 'Alice Johnson', 'alice@example.com');
developer1.hourlyRate = 75;

// Add skills
const tsSkill = new Skill('TypeScript', 9, 'Programming Languages');
tsSkill.yearsExperience = 5;
tsSkill.addCertification('Microsoft TypeScript Certification');
developer1.addSkill(tsSkill);

const reactSkill = new Skill('React', 8, 'Frontend Frameworks');
reactSkill.yearsExperience = 4;
reactSkill.addCertification('Meta React Certification');
developer1.addSkill(reactSkill);

const nodeSkill = new Skill('Node.js', 7, 'Backend Technologies');
nodeSkill.yearsExperience = 3;
developer1.addSkill(nodeSkill);

developer1.preferredTechnologies = ['TypeScript', 'React', 'Node.js', 'GraphQL'];

// Add projects
const project1 = new Project('proj1', 'E-commerce Platform', 'Modern e-commerce solution');
project1.addTechnology('TypeScript');
project1.addTechnology('React');
project1.addTechnology('Node.js');
project1.addTechnology('PostgreSQL');
project1.teamSize = 5;
project1.budget = 150000;
project1.status = 'active';
developer1.addProject(project1);

const project2 = new Project('proj2', 'Mobile App Backend', 'REST API for mobile application');
project2.addTechnology('Node.js');
project2.addTechnology('Express');
project2.addTechnology('MongoDB');
project2.teamSize = 3;
project2.budget = 80000;
project2.status = 'completed';
project2.complete();
developer1.addProject(project2);

// Create second developer
const developer2 = new Developer(2, 'Bob Smith', 'bob@example.com');
developer2.hourlyRate = 85;

const pythonSkill = new Skill('Python', 10, 'Programming Languages');
pythonSkill.yearsExperience = 8;
pythonSkill.addCertification('Python Institute PCEP');
pythonSkill.addCertification('Python Institute PCAP');
developer2.addSkill(pythonSkill);

const mlSkill = new Skill('Machine Learning', 9, 'Data Science');
mlSkill.yearsExperience = 6;
mlSkill.addCertification('Google ML Engineer Certification');
developer2.addSkill(mlSkill);

const dockerSkill = new Skill('Docker', 7, 'DevOps');
dockerSkill.yearsExperience = 4;
developer2.addSkill(dockerSkill);

developer2.preferredTechnologies = ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes'];

const project3 = new Project('proj3', 'AI Recommendation System', 'ML-powered recommendation engine');
project3.addTechnology('Python');
project3.addTechnology('TensorFlow');
project3.addTechnology('FastAPI');
project3.addTechnology('Redis');
project3.teamSize = 4;
project3.budget = 200000;
project3.status = 'active';
developer2.addProject(project3);

// Update availability based on current workload
developer1.updateAvailability();
developer2.updateAvailability();

const developers = [developer1, developer2];

console.log('Developer Team Analysis:');
developers.forEach(dev => {
  console.log(`\\n${dev.name} (${dev.email}):`);\n  console.log(`  Skills: ${dev.skills.length}`);\n  console.log(`  Expert Skills: ${dev.getExpertSkills().map(s => s.name).join(', ')}`);\n  console.log(`  Average Skill Level: ${dev.getAverageSkillLevel().toFixed(1)}`);\n  console.log(`  Total Projects: ${dev.projects.length}`);\n  console.log(`  Active Projects: ${dev.currentProjects.length}`);\n  console.log(`  Availability: ${dev.availability}%`);\n  console.log(`  Hourly Rate: $${dev.hourlyRate}`);\n  \n  console.log(`  Programming Languages:`);\n  dev.getSkillsByCategory('Programming Languages').forEach(skill => {\n    console.log(`    ${skill.name}: Level ${skill.level} (${skill.yearsExperience} years)`);\n  });\n});\n\n// Analyze team capabilities\nconsole.log('\\nTeam Analysis:');\nconst allSkills = developers.flatMap(dev => dev.skills);\nconst skillCategories = [...new Set(allSkills.map(skill => skill.category))];\n\nskillCategories.forEach(category => {\n  const categorySkills = allSkills.filter(skill => skill.category === category);\n  const avgLevel = categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length;\n  console.log(`  ${category}: ${categorySkills.length} skills, avg level ${avgLevel.toFixed(1)}`);\n});\n\nconst allTechnologies = [...new Set(developers.flatMap(dev => dev.preferredTechnologies))];\nconsole.log(`  Preferred Technologies: ${allTechnologies.join(', ')}`);\n\nconst availableDevelopers = developers.filter(dev => dev.isAvailableForWork());\nconsole.log(`  Available for new work: ${availableDevelopers.length}/${developers.length}`);\n\n// Serialize the team\nconst teamJson = S7e.serializeArray(developers);\nconsole.log(`\\nSerialized team size: ${teamJson.length} characters`);\n\n// Deserialize and verify\nconst deserializedTeam = S7e.deserializeArray(Developer, teamJson);\nconsole.log(`\\nDeserialized team size: ${deserializedTeam.length}`);\n\n// Verify complex nested arrays\nconst deserializedDev1 = deserializedTeam[0];\nconsole.log(`\\nFirst developer verification:`);\nconsole.log(`  Name: ${deserializedDev1.name}`);\nconsole.log(`  Skills count: ${deserializedDev1.skills.length}`);\nconsole.log(`  Projects count: ${deserializedDev1.projects.length}`);\nconsole.log(`  All skills are Skill instances: ${deserializedDev1.skills.every(s => s instanceof Skill)}`);\nconsole.log(`  All projects are Project instances: ${deserializedDev1.projects.every(p => p instanceof Project)}`);\n\n// Verify skill certifications (nested string arrays)\nconst firstSkill = deserializedDev1.skills[0];\nconsole.log(`  First skill certifications: ${firstSkill.certifications.length}`);\nconsole.log(`  Certifications preserved: ${firstSkill.certifications.join(', ')}`);\n\n// Verify project technologies (nested string arrays)\nconst firstProject = deserializedDev1.projects[0];\nconsole.log(`  First project technologies: ${firstProject.technologies.length}`);\nconsole.log(`  Technologies preserved: ${firstProject.technologies.join(', ')}`);\n\n// Verify date objects in projects\nconsole.log(`  Project start date is Date: ${firstProject.startDate instanceof Date}`);\nif (firstProject.endDate) {\n  console.log(`  Project end date is Date: ${firstProject.endDate instanceof Date}`);\n}\n\n// Test array manipulation after deserialization\ndeserializedDev1.addSkill(new Skill('GraphQL', 6, 'API Technologies'));\nconsole.log(`\\nAfter adding new skill: ${deserializedDev1.skills.length} skills`);\n\nconst newProject = new Project('proj4', 'New Dashboard', 'Analytics dashboard');\nnewProject.addTechnology('TypeScript');\nnewProject.addTechnology('Vue.js');\ndeserializedDev1.addProject(newProject);\nconsole.log(`After adding new project: ${deserializedDev1.projects.length} projects`);\n```\n\n## Nested Array Structures\n\nHandling deeply nested arrays and complex data structures.\n\n```typescript\n@JsonClass({ name: 'DataPoint' })\nclass DataPoint {\n  @JsonProperty({ name: 'timestamp', type: Date })\n  public timestamp: Date;\n\n  @JsonProperty({ name: 'value', type: Number })\n  public value: number;\n\n  @JsonProperty({ name: 'tags', type: [String] })\n  public tags: string[];\n\n  @JsonProperty({ name: 'metadata', type: Object, optional: true })\n  public metadata?: Record<string, any>;\n\n  constructor(value: number) {\n    this.timestamp = new Date();\n    this.value = value;\n    this.tags = [];\n  }\n\n  public addTag(tag: string): void {\n    if (!this.tags.includes(tag)) {\n      this.tags.push(tag);\n    }\n  }\n}\n\n@JsonClass({ name: 'TimeSeries' })\nclass TimeSeries {\n  @JsonProperty({ name: 'name', type: String })\n  public name: string;\n\n  @JsonProperty({ name: 'unit', type: String })\n  public unit: string;\n\n  @JsonProperty({ name: 'dataPoints', type: [DataPoint] })\n  public dataPoints: DataPoint[];\n\n  @JsonProperty({ name: 'aggregations', type: Object, optional: true })\n  public aggregations?: {\n    min: number;\n    max: number;\n    avg: number;\n    sum: number;\n    count: number;\n  };\n\n  constructor(name: string, unit: string) {\n    this.name = name;\n    this.unit = unit;\n    this.dataPoints = [];\n  }\n\n  public addDataPoint(point: DataPoint): void {\n    this.dataPoints.push(point);\n    this.updateAggregations();\n  }\n\n  public addValue(value: number, tags?: string[]): void {\n    const point = new DataPoint(value);\n    if (tags) {\n      tags.forEach(tag => point.addTag(tag));\n    }\n    this.addDataPoint(point);\n  }\n\n  private updateAggregations(): void {\n    if (this.dataPoints.length === 0) {\n      this.aggregations = undefined;\n      return;\n    }\n\n    const values = this.dataPoints.map(p => p.value);\n    this.aggregations = {\n      min: Math.min(...values),\n      max: Math.max(...values),\n      avg: values.reduce((sum, val) => sum + val, 0) / values.length,\n      sum: values.reduce((sum, val) => sum + val, 0),\n      count: values.length\n    };\n  }\n\n  public getDataPointsByTag(tag: string): DataPoint[] {\n    return this.dataPoints.filter(point => point.tags.includes(tag));\n  }\n\n  public getDataPointsInRange(start: Date, end: Date): DataPoint[] {\n    return this.dataPoints.filter(point => \n      point.timestamp >= start && point.timestamp <= end\n    );\n  }\n}\n\n@JsonClass({ name: 'Dashboard' })\nclass Dashboard {\n  @JsonProperty({ name: 'id', type: String })\n  public id: string;\n\n  @JsonProperty({ name: 'title', type: String })\n  public title: string;\n\n  @JsonProperty({ name: 'description', type: String, optional: true })\n  public description?: string;\n\n  @JsonProperty({ name: 'timeSeries', type: [TimeSeries] })\n  public timeSeries: TimeSeries[];\n\n  @JsonProperty({ name: 'layout', type: Object })\n  public layout: {\n    columns: number;\n    rows: number;\n    widgets: Array<{\n      id: string;\n      type: string;\n      position: { x: number; y: number };\n      size: { width: number; height: number };\n      seriesNames: string[];\n    }>;\n  };\n\n  @JsonProperty({ name: 'filters', type: [String] })\n  public filters: string[];\n\n  @JsonProperty({ name: 'refreshInterval', type: Number })\n  public refreshInterval: number; // in seconds\n\n  @JsonProperty({ name: 'created', type: Date })\n  public created: Date;\n\n  @JsonProperty({ name: 'lastUpdated', type: Date })\n  public lastUpdated: Date;\n\n  constructor(id: string, title: string) {\n    this.id = id;\n    this.title = title;\n    this.timeSeries = [];\n    this.layout = {\n      columns: 12,\n      rows: 8,\n      widgets: []\n    };\n    this.filters = [];\n    this.refreshInterval = 60;\n    this.created = new Date();\n    this.lastUpdated = new Date();\n  }\n\n  public addTimeSeries(series: TimeSeries): void {\n    if (!this.timeSeries.find(s => s.name === series.name)) {\n      this.timeSeries.push(series);\n      this.lastUpdated = new Date();\n    }\n  }\n\n  public addWidget(widget: {\n    id: string;\n    type: string;\n    position: { x: number; y: number };\n    size: { width: number; height: number };\n    seriesNames: string[];\n  }): void {\n    // Validate that all series names exist\n    const validSeriesNames = widget.seriesNames.filter(name => \n      this.timeSeries.some(series => series.name === name)\n    );\n    \n    if (validSeriesNames.length > 0) {\n      this.layout.widgets.push({\n        ...widget,\n        seriesNames: validSeriesNames\n      });\n      this.lastUpdated = new Date();\n    }\n  }\n\n  public getSeriesByName(name: string): TimeSeries | undefined {\n    return this.timeSeries.find(series => series.name === name);\n  }\n\n  public getTotalDataPoints(): number {\n    return this.timeSeries.reduce((total, series) => total + series.dataPoints.length, 0);\n  }\n\n  public getDataPointsByTag(tag: string): DataPoint[] {\n    return this.timeSeries.flatMap(series => series.getDataPointsByTag(tag));\n  }\n\n  public addFilter(filter: string): void {\n    if (!this.filters.includes(filter)) {\n      this.filters.push(filter);\n      this.lastUpdated = new Date();\n    }\n  }\n\n  public removeFilter(filter: string): void {\n    const index = this.filters.indexOf(filter);\n    if (index >= 0) {\n      this.filters.splice(index, 1);\n      this.lastUpdated = new Date();\n    }\n  }\n}\n\n// Create a complex analytics dashboard\nconst dashboard = new Dashboard('analytics-001', 'Server Monitoring Dashboard');\ndashboard.description = 'Real-time server performance metrics';\n\n// Create CPU usage time series\nconst cpuSeries = new TimeSeries('CPU Usage', 'percentage');\nfor (let i = 0; i < 100; i++) {\n  const value = 20 + Math.random() * 60; // Random CPU usage between 20-80%\n  const point = new DataPoint(value);\n  point.timestamp = new Date(Date.now() - (100 - i) * 60000); // Data points every minute\n  \n  if (value > 70) point.addTag('high');\n  else if (value > 40) point.addTag('medium');\n  else point.addTag('low');\n  \n  point.addTag('cpu');\n  point.addTag('system');\n  cpuSeries.addDataPoint(point);\n}\n\n// Create memory usage time series\nconst memorySeries = new TimeSeries('Memory Usage', 'MB');\nfor (let i = 0; i < 100; i++) {\n  const value = 1000 + Math.random() * 2000; // Random memory usage between 1GB-3GB\n  const point = new DataPoint(value);\n  point.timestamp = new Date(Date.now() - (100 - i) * 60000);\n  \n  if (value > 2500) point.addTag('high');\n  else if (value > 1500) point.addTag('medium');\n  else point.addTag('low');\n  \n  point.addTag('memory');\n  point.addTag('system');\n  memorySeries.addDataPoint(point);\n}\n\n// Create network traffic time series\nconst networkSeries = new TimeSeries('Network Traffic', 'Mbps');\nfor (let i = 0; i < 100; i++) {\n  const value = Math.random() * 100; // Random network usage\n  const point = new DataPoint(value);\n  point.timestamp = new Date(Date.now() - (100 - i) * 60000);\n  \n  if (value > 80) point.addTag('high');\n  else if (value > 40) point.addTag('medium');\n  else point.addTag('low');\n  \n  point.addTag('network');\n  point.addTag('traffic');\n  networkSeries.addDataPoint(point);\n}\n\n// Add time series to dashboard\ndashboard.addTimeSeries(cpuSeries);\ndashboard.addTimeSeries(memorySeries);\ndashboard.addTimeSeries(networkSeries);\n\n// Add widgets to dashboard\ndashboard.addWidget({\n  id: 'cpu-chart',\n  type: 'line-chart',\n  position: { x: 0, y: 0 },\n  size: { width: 6, height: 4 },\n  seriesNames: ['CPU Usage']\n});\n\ndashboard.addWidget({\n  id: 'memory-chart',\n  type: 'area-chart',\n  position: { x: 6, y: 0 },\n  size: { width: 6, height: 4 },\n  seriesNames: ['Memory Usage']\n});\n\ndashboard.addWidget({\n  id: 'network-chart',\n  type: 'line-chart',\n  position: { x: 0, y: 4 },\n  size: { width: 8, height: 4 },\n  seriesNames: ['Network Traffic']\n});\n\ndashboard.addWidget({\n  id: 'overview',\n  type: 'stats-widget',\n  position: { x: 8, y: 4 },\n  size: { width: 4, height: 4 },\n  seriesNames: ['CPU Usage', 'Memory Usage', 'Network Traffic']\n});\n\n// Add filters\ndashboard.addFilter('system');\ndashboard.addFilter('high');\ndashboard.addFilter('last-hour');\n\nconsole.log('Dashboard Analysis:');\nconsole.log(`Title: ${dashboard.title}`);\nconsole.log(`Time Series: ${dashboard.timeSeries.length}`);\nconsole.log(`Total Data Points: ${dashboard.getTotalDataPoints()}`);\nconsole.log(`Widgets: ${dashboard.layout.widgets.length}`);\nconsole.log(`Filters: ${dashboard.filters.join(', ')}`);\n\n// Analyze each time series\ndashboard.timeSeries.forEach(series => {\n  console.log(`\\n${series.name} (${series.unit}):`);\n  if (series.aggregations) {\n    console.log(`  Min: ${series.aggregations.min.toFixed(2)}`);\n    console.log(`  Max: ${series.aggregations.max.toFixed(2)}`);\n    console.log(`  Avg: ${series.aggregations.avg.toFixed(2)}`);\n    console.log(`  Total Points: ${series.aggregations.count}`);\n  }\n  \n  const highPoints = series.getDataPointsByTag('high');\n  const mediumPoints = series.getDataPointsByTag('medium');\n  const lowPoints = series.getDataPointsByTag('low');\n  \n  console.log(`  High: ${highPoints.length}, Medium: ${mediumPoints.length}, Low: ${lowPoints.length}`);\n});\n\n// Get data points with specific tags\nconst highUsagePoints = dashboard.getDataPointsByTag('high');\nconsole.log(`\\nHigh usage data points across all series: ${highUsagePoints.length}`);\n\n// Serialize the entire dashboard\nconst dashboardJson = S7e.serialize(dashboard);\nconsole.log(`\\nSerialized dashboard size: ${dashboardJson.length} characters`);\nconsole.log(`Estimated size: ${(dashboardJson.length / 1024).toFixed(2)} KB`);\n\n// Deserialize and verify complex nested structure\nconst deserializedDashboard = S7e.deserialize(Dashboard, dashboardJson);\nconsole.log(`\\nDeserialized dashboard: ${deserializedDashboard.title}`);\nconsole.log(`Time series count: ${deserializedDashboard.timeSeries.length}`);\nconsole.log(`Total data points: ${deserializedDashboard.getTotalDataPoints()}`);\n\n// Verify nested arrays and objects\nconst firstSeries = deserializedDashboard.timeSeries[0];\nconsole.log(`\\nFirst series verification:`);\nconsole.log(`  Name: ${firstSeries.name}`);\nconsole.log(`  Data points: ${firstSeries.dataPoints.length}`);\nconsole.log(`  All data points are DataPoint instances: ${firstSeries.dataPoints.every(p => p instanceof DataPoint)}`);\nconsole.log(`  All timestamps are Date objects: ${firstSeries.dataPoints.every(p => p.timestamp instanceof Date)}`);\n\n// Verify deeply nested arrays (tags within data points)\nconst firstDataPoint = firstSeries.dataPoints[0];\nconsole.log(`  First data point tags: ${firstDataPoint.tags.join(', ')}`);\nconsole.log(`  Tags array length: ${firstDataPoint.tags.length}`);\n\n// Verify aggregations object\nif (firstSeries.aggregations) {\n  console.log(`  Aggregations preserved: min=${firstSeries.aggregations.min.toFixed(2)}, max=${firstSeries.aggregations.max.toFixed(2)}`);\n}\n\n// Verify layout widgets array\nconsole.log(`\\nLayout verification:`);\nconsole.log(`  Widgets count: ${deserializedDashboard.layout.widgets.length}`);\nconst firstWidget = deserializedDashboard.layout.widgets[0];\nconsole.log(`  First widget series names: ${firstWidget.seriesNames.join(', ')}`);\nconsole.log(`  Widget position: (${firstWidget.position.x}, ${firstWidget.position.y})`);\nconsole.log(`  Widget size: ${firstWidget.size.width}x${firstWidget.size.height}`);\n\n// Test functionality after deserialization\nconst testSeries = new TimeSeries('Test Series', 'units');\ntestSeries.addValue(42, ['test', 'validation']);\ndeserializedDashboard.addTimeSeries(testSeries);\n\nconsole.log(`\\nAfter adding test series: ${deserializedDashboard.timeSeries.length} total series`);\nconsole.log(`New series data points: ${testSeries.dataPoints.length}`);\nconsole.log(`Dashboard last updated: ${deserializedDashboard.lastUpdated}`);\n```\n\n## Array Performance and Best Practices\n\nOptimization techniques for working with large arrays.\n\n```typescript\n// Efficient batch operations\n@JsonClass({ name: 'BatchProcessor' })\nclass BatchProcessor {\n  @JsonProperty({ name: 'items', type: [String] })\n  public items: string[];\n\n  @JsonProperty({ name: 'processed', type: [Boolean] })\n  public processed: boolean[];\n\n  @JsonProperty({ name: 'results', type: [Number] })\n  public results: number[];\n\n  @JsonProperty({ name: 'batchSize', type: Number })\n  public batchSize: number;\n\n  constructor(batchSize: number = 1000) {\n    this.items = [];\n    this.processed = [];\n    this.results = [];\n    this.batchSize = batchSize;\n  }\n\n  public addItems(items: string[]): void {\n    this.items.push(...items);\n    this.processed.push(...new Array(items.length).fill(false));\n    this.results.push(...new Array(items.length).fill(0));\n  }\n\n  public processBatch(startIndex: number = 0): number {\n    const endIndex = Math.min(startIndex + this.batchSize, this.items.length);\n    let processedCount = 0;\n\n    for (let i = startIndex; i < endIndex; i++) {\n      if (!this.processed[i]) {\n        this.results[i] = this.processItem(this.items[i]);\n        this.processed[i] = true;\n        processedCount++;\n      }\n    }\n\n    return processedCount;\n  }\n\n  private processItem(item: string): number {\n    // Simulate processing\n    return item.length * Math.random();\n  }\n\n  public getProgress(): { processed: number; total: number; percentage: number } {\n    const processedCount = this.processed.filter(p => p).length;\n    return {\n      processed: processedCount,\n      total: this.items.length,\n      percentage: this.items.length > 0 ? (processedCount / this.items.length) * 100 : 0\n    };\n  }\n}\n\n// Create large dataset for performance testing\nconst processor = new BatchProcessor(500);\nconst largeDataset = Array.from({ length: 10000 }, (_, i) => `item_${i.toString().padStart(5, '0')}`);\n\nconsole.log('Performance Test:');\nconsole.log(`Adding ${largeDataset.length} items...`);\n\nconst startTime = Date.now();\nprocessor.addItems(largeDataset);\nconst addTime = Date.now() - startTime;\n\nconsole.log(`Items added in ${addTime}ms`);\nconsole.log(`Memory usage: ~${JSON.stringify(processor).length} characters`);\n\n// Process in batches\nlet totalProcessed = 0;\nlet batchIndex = 0;\nconst batchTimes: number[] = [];\n\nwhile (totalProcessed < processor.items.length) {\n  const batchStart = Date.now();\n  const processedInBatch = processor.processBatch(totalProcessed);\n  const batchTime = Date.now() - batchStart;\n  \n  batchTimes.push(batchTime);\n  totalProcessed += processedInBatch;\n  batchIndex++;\n  \n  const progress = processor.getProgress();\n  console.log(`Batch ${batchIndex}: ${processedInBatch} items in ${batchTime}ms (${progress.percentage.toFixed(1)}% complete)`);\n}\n\nconst avgBatchTime = batchTimes.reduce((sum, time) => sum + time, 0) / batchTimes.length;\nconsole.log(`\\nAverage batch processing time: ${avgBatchTime.toFixed(2)}ms`);\n\n// Serialize large dataset\nconsole.log('\\nSerialization Performance:');\nconst serializeStart = Date.now();\nconst serialized = S7e.serialize(processor);\nconst serializeTime = Date.now() - serializeStart;\n\nconsole.log(`Serialized ${processor.items.length} items in ${serializeTime}ms`);\nconsole.log(`Serialized size: ${(serialized.length / 1024 / 1024).toFixed(2)} MB`);\n\n// Deserialize large dataset\nconst deserializeStart = Date.now();\nconst deserialized = S7e.deserialize(BatchProcessor, serialized);\nconst deserializeTime = Date.now() - deserializeStart;\n\nconsole.log(`Deserialized ${deserialized.items.length} items in ${deserializeTime}ms`);\n\n// Verify integrity\nconst integritCheck = {\n  itemsMatch: JSON.stringify(processor.items) === JSON.stringify(deserialized.items),\n  processedMatch: JSON.stringify(processor.processed) === JSON.stringify(deserialized.processed),\n  resultsMatch: JSON.stringify(processor.results) === JSON.stringify(deserialized.results)\n};\n\nconsole.log('\\nIntegrity Check:');\nconsole.log(`Items match: ${integritCheck.itemsMatch}`);\nconsole.log(`Processed flags match: ${integritCheck.processedMatch}`);\nconsole.log(`Results match: ${integritCheck.resultsMatch}`);\nconsole.log(`All arrays preserved: ${Object.values(integritCheck).every(Boolean)}`);\n```\n\n## Next Steps\n\nThis guide covered advanced array handling patterns with S7E. Continue exploring:\n\n- [Optional Properties](/examples/optional-properties) - Flexible data structures\n- [Custom Naming](/examples/custom-naming) - API integration patterns  \n- [Type Validation](/examples/type-validation) - Advanced validation techniques
